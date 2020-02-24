export function getAnswers(data) {
  return data.map(item => {
    if (item.checked) {
      return 1
    }

    return 0
  })
}

export function cleanAnswers(data) {
  for(let i = 0; i < data.length; i++) {
    data[i].checked = false
  }
}

export function answersValid(data) {
  return data.find(item => item > 0)
}

export function setFirebase() {
  if (firebase.apps.length === 0) {
    var firebaseConfig = {
      
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  }
}

export async function getDatabase() {
  const ref = firebase.app().database().ref();
  const snap = await ref.once('value')
  const database = snap.val()

  return database
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function loadContract() {
  window.nearConfig = Cookies.getJSON('fiddleConfig')

    // Initializing connection to the NEAR node.
  window.near = await nearlib.connect(Object.assign(nearConfig, { deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() }}));

  // Needed to access wallet login
  window.walletAccount = new nearlib.WalletAccount(window.near);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['totalSupply', 'balanceOf', 'allowance'],
    changeMethods: ['init', 'transfer', 'approve', 'transferFrom'],
    sender: window.walletAccount.getAccountId()
  });
}

export function getUUID() {
  const cookeUUId = Cookies.get('uuid')

  if (!cookeUUId || cookeUUId.length !== 36) {
    const uuid = uuidv4()
    Cookies.set('uuid', uuid)
  }

  return Cookies.get('uuid')
}

export async function getTokens(uuid) {
  if (uuid) {
    return await contract.balanceOf({tokenOwner: uuid.toString()})
  }

  return 0
}

export async function addTokens(amount, uuid) {
  if (uuid) {
    await contract.transfer({
      to: uuid,
      tokens: amount.toString()
    })
  }
}
