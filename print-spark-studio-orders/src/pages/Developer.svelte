<script lang="ts">
  import { maintenanceMode, toggleMaintenanceMode } from '../services/maintenanceService';
</script>

<div class="developer-container">
  <h1>Developer Tools</h1>
  
  <div class="section">
    <h2>Maintenance Mode</h2>
    <div class="toggle-container">
      <label class="switch">
        <input type="checkbox" bind:checked={$maintenanceMode} on:change={toggleMaintenanceMode}>
        <span class="slider round"></span>
      </label>
      <span class="toggle-label">Maintenance Mode {$maintenanceMode ? 'ON' : 'OFF'}</span>
    </div>
    <p class="description">When enabled, all users will see the maintenance page instead of the application.</p>
  </div>
</div>

<style>
  .developer-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  h2 {
    color: #444;
    margin-bottom: 1rem;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .toggle-label {
    font-weight: 500;
  }

  .description {
    color: #666;
    font-size: 0.9rem;
  }

  /* Toggle Switch Styles */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style> 