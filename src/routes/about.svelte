<script>
	import { onMount } from 'svelte';

	import SubHeader from '../components/SubHeader.svelte';
	import { 
		getAnswers, 
		cleanAnswers, 
		getDatabase, 
		answersValid, 
		setFirebase, 
		loadContract,
		getUUID,
		getTokens,
		addTokens
	} from '../utils/helpers'

	let answers = [];
	let features = [];
	let cities = []
	let prediction = []
	let modelTrained = false
	let msg = ''
	let tokens = 0
	let uuid = ''
	
	const model = tf.sequential()
	let xs
	let ys
	let loss = 0

	function convertToInt(value) {
		return parseInt(value)
	}

	function getModelData() {
		const response = {
			inputs: [],
			outputs: []
		}
		
		Object.entries(answers).forEach(item => {
			const [answerID, values] = item

			Object.values(values).forEach(row => {
				response.inputs.push(row)
				response.outputs.push(answerID)
			})
		})

		response.inputs = response.inputs.map(rows => rows.map(convertToInt))
		response.outputs = response.outputs.map(value => convertToInt(value) - 1)

		return response
	}

	async function train() {
		for( let i = 0; i < 10; i++) {
			const response = await model.fit(xs, ys, { epochs: 10, shuffle: true })
			loss = response.history.loss[0]
		}
		modelTrained = true
	}

	async function setModel() {
		if (!Array.isArray(answers) || !answers.length) {
			return
		}

		model.add(tf.layers.dense({
			units: 3,
			inputShape: [8],
			activation: 'sigmoid',
		}))

		model.compile({
			loss:'meanSquaredError',
			optimizer: 'sgd',
		})

		const modelData = getModelData()

		xs = tf.tensor2d(modelData.inputs)
		xs.print()

		ys = tf.oneHot(tf.tensor1d(modelData.outputs, 'int32'), 3)
		ys.print()

		await train(xs, ys)
	}

	function printMessage(text) {
		msg = text
		
		setTimeout(() => {
			msg = ""
		}, 3000);
	}

	async function clickHandlerPredict (event) {
		event.preventDefault()

		const answers = getAnswers(features)

		if (answersValid(answers)) {
			const input = tf.tensor2d([answers])
			prediction = model.predict(input).dataSync()
		} else {
			printMessage("Choose some options first.")
		}
	}

	async function clickHandlerTrain(event) {
		event.preventDefault()

		modelTrained = false
		prediction = []
		train()

		printMessage("Traning Done")

		await addTokens(20, uuid)
		tokens = await getTokens(uuid)
	}

	async function setData() {

		const db = await getDatabase()

		features = db.features
		cities = db.cities
		answers = db.answers
	}

	onMount(async () => {
		setFirebase()

		await setData()

		cleanAnswers(features)

		await loadContract()

		uuid = getUUID()

		tokens = await getTokens(uuid)

		await setModel()
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
	<title>Demo Prediction</title>
</svelte:head>

<SubHeader {tokens} {uuid} title="Select your preferences" />

<ul>
{#each features as feature}
	<li>
		<input type=checkbox bind:checked={feature.checked} /> {feature.name}
	</li>
{/each}
</ul>

{#if modelTrained}
	<div class="center">
		<a href="/" on:click={clickHandlerPredict}>Predict</a>

		<a href="/" on:click={clickHandlerTrain}>Train</a>

		<p class="msg">
			{msg}
		</p>
	</div>
{/if}


<ul>
	{#each prediction as value, index}
		<li>
			<div>
				{cities[index].name}: { parseFloat(value * 100).toFixed(4)} %
			</div>
		</li>
	{/each}
	<li><br /></li>
	<li>Loss: {loss}
</ul>
