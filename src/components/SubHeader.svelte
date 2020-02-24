<script>
  export let tokens;
  export let uuid;
  export let title;
</script>

<style>
  .subheader {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    margin-bottom: 20px;
  }

  h1 {
		text-align: center;
		margin: 0 auto;
		font-size: 2em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}
</style>

<div class="subheader">
  <div>
    tokens: <b>{tokens}</b>
    <br />
    uuid: <b>{uuid}</b>
  </div>
</div>

<h1>{title}</h1>
