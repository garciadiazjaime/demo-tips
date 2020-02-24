<script>
	import { onMount } from 'svelte';

	import SubHeader from '../components/SubHeader.svelte';
	import { 
		getAnswers,
		getDatabase,
		answersValid,
		setFirebase,
		loadContract,
		getUUID,
		getTokens,
		addTokens
	} from '../utils/helpers'

	let features = [];
	let cities = []
	let current_city = 0
	let msg = ''
	let tokens = 0
	let uuid = ''

	function cleanAnswers() {
		for(let i = 0; i < features.length; i++) {
			features[i].checked = false
		}
	}

	function saveAnswers(cityID, answers) {
		if (cityID && answers.find(item => item > 0)) {
			firebase.database().ref(`answers/${cityID}`).push(answers);
		}
	}

	function changeCity() {
		const randomValue = Math.floor(Math.random() * 2)
		if (current_city < cities.length - 1) {
			current_city += 1
		} else {
			current_city = 0
		}
	}

	function printMessage(text) {
		msg = text
		
		setTimeout(() => {
			msg = ""
		}, 3000);
	}

	async function clickHandler (event) {
		event.preventDefault()

		const answers = getAnswers(features)

		if (answersValid(answers)) {
			saveAnswers(cities[current_city].id, answers)

			cleanAnswers()

			printMessage("Thanks for your vote, enjoy your tokens.")

			await addTokens(20, uuid)

			tokens = await getTokens(uuid)

			changeCity()
		} else {
			printMessage("Choose some options first.")
		}
	}

	function setCookies(config) {
		Cookies.set("fiddleConfig", JSON.stringify(config.fiddleConfig))
		localStorage.setItem("nearlib:keystore:demo-events:default", config.keystore)
		localStorage.setItem("studio-mfj75odpb_wallet_auth_key", JSON.stringify(config.auth_key))
	}

	async function setData() {
		const db = await getDatabase()

		features = db.features
		cities = db.cities
		setCookies(db.config)
	}

	onMount(async () => {
		setFirebase()

		await setData()

		cleanAnswers()

		await loadContract()

		uuid = getUUID()

		tokens = await getTokens(uuid)
	});
</script>


<style>
	ul {
		list-style-type: none;
		font-size: 1.5em;
	}

	a {
		font-size: 2em;
		padding: 10px 20px;
		text-decoration: none;
		border: 1px solid rgb(255,62,0);
	}

	a:hover {
		cursor: pointer;
		text-decoration: underline;
	}

	.center {
		text-align: center;
	}

	.msg {
		font-size: 1.3em;
		color: rgb(255,62,0);
	}
</style>

<svelte:head>
	<title>Demo Survey</title>
</svelte:head>

<SubHeader {tokens} {uuid} title={cities[current_city] && cities[current_city].name || ''} />

<ul>
{#each features as feature}
	<li>
		<input type=checkbox bind:checked={feature.checked} /> {feature.name}
	</li>
{/each}
</ul>

<div class="center">
	<a href="/" on:click={clickHandler}>Vote</a>

	<p class="msg">
		{msg}
	</p>
</div>
