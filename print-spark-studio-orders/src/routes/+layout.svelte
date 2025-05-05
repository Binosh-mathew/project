<script lang="ts">
  import { page } from '$app/stores';
  import { maintenanceMode } from '../services/maintenanceService';
  import { goto } from '$app/navigation';
</script>

{#if $maintenanceMode && $page.url.pathname !== '/maintenance' && $page.url.pathname !== '/developer'}
  <svelte:component this={goto('/maintenance')} />
{:else}
  <slot />
{/if} 