<script>
  import { state, addHabit, completeHabit, todayId, completionsThisWeek } from '$lib/state.js';
  import { onMount } from 'svelte';
  let newHabit = { name:'', description:'', scheduleType:'daysOfWeek', days:[0,1,2,3,4,5,6], timesPerWeek:3, target:1 };
  let today = new Date();
  let weekday = today.getDay();
  let showForm = false;
  function toggleDay(d){ if(newHabit.days.includes(d)) newHabit.days = newHabit.days.filter(x=>x!==d); else newHabit.days=[...newHabit.days,d]; }
  function save(){
    if(!newHabit.name.trim()) return;
    if(newHabit.scheduleType==='daysOfWeek' && newHabit.days.length===0) return;
    addHabit({...newHabit});
    newHabit = { name:'', description:'', scheduleType:'daysOfWeek', days:[0,1,2,3,4,5,6], timesPerWeek:3, target:1 };
    showForm=false;
  }
  function dueHabits(){
    return state.habits.filter(h => h.scheduleType==='timesPerWeek' ? (completionsThisWeek(h) < (h.timesPerWeek||3)) : h.days.includes(weekday));
  }
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
</script>

<style>
  .app{max-width:960px;margin:2rem auto;padding:1rem;font-family:Inter,system-ui,sans-serif;color:#fff;background:#0d1218;}
  h1{font-size:1.4rem;margin:0 0 1rem;}
  .habits{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));}
  .card{background:#1c2530;border:1px solid #2c3a46;padding:.8rem .85rem;border-radius:16px;display:flex;flex-direction:column;gap:.5rem;}
  .card.done{border-color:#3fb563;}
  button{cursor:pointer;font:inherit;border-radius:10px;border:1px solid #2c3a46;background:#141b23;color:#fff;padding:.5rem .8rem;font-size:.7rem;letter-spacing:.5px;font-weight:600;}
  button.primary{background:linear-gradient(135deg,#4d8dff,#7c5dff);border:0;}
  .meta{font-size:.55rem;opacity:.75;display:flex;flex-wrap:wrap;gap:.35rem;}
  form{display:flex;flex-direction:column;gap:.6rem;margin:1rem 0;background:#141b23;border:1px solid #2c3a46;padding:1rem;border-radius:18px;}
  input,textarea,select{background:#1c2530;border:1px solid #2c3a46;color:#fff;padding:.5rem .65rem;border-radius:10px;font-size:.75rem;}
  label{font-size:.6rem;text-transform:uppercase;letter-spacing:.6px;display:flex;flex-direction:column;gap:.25rem;}
  .days{display:flex;flex-wrap:wrap;gap:.3rem;}
  .days button{padding:.35rem .5rem;font-size:.55rem;background:#1c2530;border:1px solid #2c3a46;}
  .days button.active{background:#4d8dff;border-color:#4d8dff;}
  .section{margin-top:2rem;}
</style>

<div class="app">
  <h1>OpenHabits (Svelte Prototype)</h1>
  <div class="section">
    <h2 style="font-size:1rem;margin:.5rem 0 .6rem;">Daily Quests</h2>
    {#if dueHabits().length === 0}
      <p style="font-size:.7rem;opacity:.6;">No quests due.</p>
    {:else}
      <div class="habits">
        {#each dueHabits() as h}
          {#key h.id}
          <div class="card { (h.history[todayId()]||0) >= h.target ? 'done':''}">
            <strong style="font-size:.85rem;">{h.name}</strong>
            <div class="meta">
              <span>🔥 {h.streak}</span>
              {#if h.scheduleType==='timesPerWeek'}
                <span>{completionsThisWeek(h)}/{h.timesPerWeek} wk</span>
              {:else}
                <span>{h.days.map(d=>dayNames[d]).join(', ')}</span>
              {/if}
              <span>{(h.history[todayId()]||0)}/{h.target}</span>
            </div>
            <button on:click={() => completeHabit(h.id)}>+1</button>
          </div>
          {/key}
        {/each}
      </div>
    {/if}
  </div>

  <div class="section">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <h2 style="font-size:1rem;margin:.5rem 0 .6rem;">All Habits</h2>
      <button class="primary" on:click={()=> showForm = !showForm}>{showForm? 'Close':'Add Habit'}</button>
    </div>
    {#if showForm}
      <form on:submit|preventDefault={save}>
        <label>Name <input bind:value={newHabit.name} required maxlength={60}></label>
        <label>Description <textarea bind:value={newHabit.description} maxlength={240}></textarea></label>
        <label>Schedule Mode
          <select bind:value={newHabit.scheduleType}>
            <option value="daysOfWeek">Days of Week</option>
            <option value="timesPerWeek">Times / Week</option>
          </select>
        </label>
        {#if newHabit.scheduleType === 'daysOfWeek'}
          <div class="days">
            {#each dayNames as dn,i}
              <button type="button" class:active={newHabit.days.includes(i)} on:click={()=> toggleDay(i)}>{dn}</button>
            {/each}
          </div>
        {:else}
          <label>Times per Week <input type="number" min={1} max={7} bind:value={newHabit.timesPerWeek}></label>
        {/if}
        <label>Target / Day <input type="number" min={1} max={20} bind:value={newHabit.target}></label>
        <button type="submit" class="primary">Save</button>
      </form>
    {/if}
    <div class="habits">
      {#each state.habits as h (h.id)}
        <div class="card { (h.history[todayId()]||0) >= h.target ? 'done':''}">
          <strong style="font-size:.85rem;">{h.name}</strong>
          <div class="meta">
            <span>🔥 {h.streak} (best {h.bestStreak})</span>
            {#if h.scheduleType==='timesPerWeek'}
              <span>{completionsThisWeek(h)}/{h.timesPerWeek} wk</span>
            {:else}
              <span>{h.days.map(d=>dayNames[d]).join(', ')}</span>
            {/if}
            <span>{(h.history[todayId()]||0)}/{h.target}</span>
          </div>
          <button on:click={() => completeHabit(h.id)}>+1</button>
        </div>
      {/each}
    </div>
  </div>
</div>
