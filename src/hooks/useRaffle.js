// useRaffle — Hook central para toda la lógica de backend.
// Maneja: publicar sorteo, cargar evento por slug, claim/verify PIN.
// El componente solo llama funciones y lee estado; nunca toca Supabase directamente.

import { useState, useEffect, useCallback } from 'react';
import {
  apiCreateEvent,
  apiGetMembers,
  apiClaimPin,
  apiVerifyPin,
  apiAdminAction,
} from '../lib/supabase';

// ─── Estado persistido en localStorage ───────────────────────
const LS_PUBLISHED = 'aguinaldo_published_event'; // { slug, adminToken }

function loadPublished() {
  try {
    const raw = localStorage.getItem(LS_PUBLISHED);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePublished(data) {
  try {
    localStorage.setItem(LS_PUBLISHED, JSON.stringify(data));
  } catch {}
}

// ─────────────────────────────────────────────────────────────

export function useRaffle() {
  // Info del evento publicado (slug + adminToken guardados localmente por el organizador)
  const [publishedEvent, setPublishedEvent] = useState(loadPublished);

  // Estado al publicar
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);

  // Datos cargados desde el servidor para la vista de grupo
  const [groupEventData, setGroupEventData] = useState(null); // { event, members }
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [loadGroupError, setLoadGroupError] = useState(null);

  // Estado del flujo PIN (para GroupRevealView)
  const [pinFlowState, setPinFlowState] = useState(null);
  // null | { step: 'select' | 'create' | 'enter' | 'revealed', member, result, error, attemptsLeft, isLocked }

  // Admin panel
  const [adminData, setAdminData] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);

  // ── 1. Publicar sorteo al backend ─────────────────────────
  const publishRaffle = useCallback(async (eventConfig, raffleResults) => {
    setIsPublishing(true);
    setPublishError(null);

    const result = await apiCreateEvent(eventConfig, raffleResults);

    if (result.error) {
      setPublishError(result.error);
      setIsPublishing(false);
      return { error: result.error };
    }

    const published = { slug: result.slug, adminToken: result.adminToken };
    savePublished(published);
    setPublishedEvent(published);
    setIsPublishing(false);
    return { slug: result.slug, adminToken: result.adminToken };
  }, []);

  // ── 2. Cargar evento por slug (vista familiar) ────────────
  const loadGroupBySlug = useCallback(async (slug) => {
    if (!slug) return;
    setIsLoadingGroup(true);
    setLoadGroupError(null);

    const result = await apiGetMembers(slug);

    if (result.error) {
      setLoadGroupError(result.error);
      setIsLoadingGroup(false);
      return;
    }

    setGroupEventData({ slug, ...result }); // { slug, event, members }
    setIsLoadingGroup(false);
    setPinFlowState({ step: 'select' });
  }, []);

  // ── 3. Seleccionar participante ───────────────────────────
  const selectMember = useCallback((member) => {
    if (!member) return;

    if (member.isLocked) {
      setPinFlowState({
        step: 'locked',
        member,
        error: 'Esta cuenta está bloqueada temporalmente por demasiados intentos.',
      });
      return;
    }

    if (!member.isClaimed) {
      // Primera vez → crear PIN
      setPinFlowState({ step: 'create', member, error: null });
    } else {
      // Ya tiene PIN → ingresar PIN
      setPinFlowState({ step: 'enter', member, error: null, attemptsLeft: 5 });
    }
  }, []);

  // ── 4. Claim: primera vez, crear PIN ─────────────────────
  const claimPin = useCallback(async (pin, confirmPin) => {
    if (!pinFlowState?.member || !groupEventData?.slug) return;

    if (pin !== confirmPin) {
      setPinFlowState((s) => ({ ...s, error: 'Los PINs no coinciden. Inténtalo de nuevo.' }));
      return;
    }

    setPinFlowState((s) => ({ ...s, error: null, isLoading: true }));

    const result = await apiClaimPin(groupEventData.slug, pinFlowState.member.id, pin);

    if (result.error) {
      setPinFlowState((s) => ({
        ...s,
        isLoading: false,
        error: result.error,
        // Si ya fue reclamado, sugerir ingresar PIN en lugar de crear
        step: result.alreadyClaimed ? 'enter' : 'create',
      }));
      return;
    }

    // ✅ PIN creado y resultado revelado
    setPinFlowState({
      step: 'revealed',
      member: pinFlowState.member,
      result: result.result,
      error: null,
    });

    // Refrescar la lista para que el nombre aparezca como "reclamado"
    await loadGroupBySlug(groupEventData.slug);
    // Restaurar el step de revealed (loadGroupBySlug lo resetea a 'select')
    setPinFlowState({
      step: 'revealed',
      member: pinFlowState.member,
      result: result.result,
      error: null,
    });
  }, [pinFlowState, groupEventData, loadGroupBySlug]);

  // ── 5. Verify: visitas siguientes, ingresar PIN ───────────
  const verifyPin = useCallback(async (pin) => {
    if (!pinFlowState?.member || !groupEventData?.slug) return;

    setPinFlowState((s) => ({ ...s, error: null, isLoading: true }));

    const result = await apiVerifyPin(groupEventData.slug, pinFlowState.member.id, pin);

    if (result.error) {
      setPinFlowState((s) => ({
        ...s,
        isLoading: false,
        error: result.error,
        attemptsLeft: result.attemptsLeft ?? s.attemptsLeft,
        isLocked: result.isLocked ?? false,
        step: result.isLocked ? 'locked' : 'enter',
      }));

      // Si fue bloqueado, refrescar la lista
      if (result.isLocked) {
        await loadGroupBySlug(groupEventData.slug);
        setPinFlowState((s) => ({ ...s, step: 'locked' }));
      }
      return;
    }

    // ✅ PIN correcto
    setPinFlowState({
      step: 'revealed',
      member: pinFlowState.member,
      result: result.result,
      error: null,
    });
  }, [pinFlowState, groupEventData, loadGroupBySlug]);

  // ── 6. Volver a la selección ──────────────────────────────
  const resetPinFlow = useCallback(() => {
    setPinFlowState({ step: 'select' });
  }, []);

  // ── 7. Admin: cargar estado de todos ─────────────────────
  const loadAdminStatus = useCallback(async (slug, adminToken) => {
    setIsAdminLoading(true);
    setAdminError(null);
    const result = await apiAdminAction(slug, adminToken, 'list-status');
    if (result.error) {
      setAdminError(result.error);
    } else {
      setAdminData(result);
    }
    setIsAdminLoading(false);
  }, []);

  // ── 8. Admin: resetear PIN de un miembro ─────────────────
  const adminResetPin = useCallback(async (memberId) => {
    if (!publishedEvent) return { error: 'No hay evento publicado.' };
    const result = await apiAdminAction(
      publishedEvent.slug,
      publishedEvent.adminToken,
      'reset-pin',
      memberId
    );
    if (!result.error) {
      // Refrescar lista admin
      await loadAdminStatus(publishedEvent.slug, publishedEvent.adminToken);
    }
    return result;
  }, [publishedEvent, loadAdminStatus]);

  // ── 9. Admin: desbloquear sin resetear PIN ────────────────
  const adminUnlock = useCallback(async (memberId) => {
    if (!publishedEvent) return { error: 'No hay evento publicado.' };
    const result = await apiAdminAction(
      publishedEvent.slug,
      publishedEvent.adminToken,
      'unlock',
      memberId
    );
    if (!result.error) {
      await loadAdminStatus(publishedEvent.slug, publishedEvent.adminToken);
    }
    return result;
  }, [publishedEvent, loadAdminStatus]);

  // ── 10. Limpiar evento publicado (para nuevo sorteo) ─────
  const clearPublishedEvent = useCallback(() => {
    localStorage.removeItem(LS_PUBLISHED);
    setPublishedEvent(null);
    setGroupEventData(null);
    setPinFlowState(null);
    setAdminData(null);
  }, []);

  // ── Generar URL pública del evento ───────────────────────
  const getEventUrl = useCallback((slug) => {
    if (!slug) return '';
    const base = window.location.origin + window.location.pathname;
    return `${base}#event=${slug}`;
  }, []);

  return {
    // Estado
    publishedEvent,
    isPublishing,
    publishError,

    groupEventData,
    isLoadingGroup,
    loadGroupError,

    pinFlowState,

    adminData,
    isAdminLoading,
    adminError,

    // Acciones organizador
    publishRaffle,
    clearPublishedEvent,
    getEventUrl,
    loadAdminStatus,
    adminResetPin,
    adminUnlock,

    // Acciones participante
    loadGroupBySlug,
    selectMember,
    claimPin,
    verifyPin,
    resetPinFlow,
  };
}
