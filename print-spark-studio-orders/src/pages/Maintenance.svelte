<script lang="ts">
  import { goto } from '$app/navigation';
  import { maintenanceMode } from '../services/maintenanceService';
</script>

<div class="maintenance-container">
  <div class="maintenance-content">
    <h1>Maintenance in Progress</h1>
    <p>We're currently performing maintenance on our system. Please check back later.</p>
    <div class="maintenance-info">
      <p>Expected completion time: 30 minutes</p>
      <p>If you're an admin, you can disable maintenance mode from the developer page.</p>
    </div>
  </div>
</div>

<style>
  .maintenance-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .maintenance-content {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 500px;
  }

  h1 {
    color: #333;
    margin-bottom: 1rem;
  }

  .maintenance-info {
    margin-top: 2rem;
    color: #666;
  }

  p {
    margin: 0.5rem 0;
  }
</style> 