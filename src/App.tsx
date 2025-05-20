import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { entries } from './data';

type Question = {
  country: string;
  userAnswer: string;
};

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const countryList: { country: string; index: number }[] =
  entries.map((e, i) => ({
    country: e.country,
    index: i,
  }));


const capitalList: { capital: string; index: number }[] =
  entries.map((e, i) => ({
    capital: e.capital,
    index: i
  }));

capitalList.sort((a, b) => a.capital.localeCompare(b.capital));

function App() {
  // Wallet
  const [selectedWallet, setSelectedWallet] = useState("lace");
  // Game
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSet, setCurrentSet] = useState<typeof countryList>([]);
  const [scoreResult, setScoreResult] = useState('');
  const [caption, setCaption] = useState('');
  const [captionColor, setCaptionColor] = useState('black');
  // Mint
  const [mintBenefAddr, setMintBenefAddr] = useState('');
  const [zkPassResult, setZkPassResult] = useState('');
  const [zkpPolicyId, setZkpPolicyId] = useState('');
  const [zkpTknName, setZkpTknName] = useState('');
  const [mintTxRef, setMintTxRef] = useState('');
  const [sendStatusC, setSendStatusC] = useState('');

  const generateQuestions = () => {
    const picked = shuffle(countryList).slice(0, 5);
    setCurrentSet(picked);
    setQuestions(picked.map(({ country }) => ({ country, userAnswer: '' })));
    setScoreResult('');
    setCaption("Enter the number of the corresponding capital!");
    setCaptionColor('black');
    setZkPassResult('');
    setMintTxRef('');
    setSendStatusC('');
  };

  const handleChange = (index: number, value: string) => {
    setQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, userAnswer: value } : q))
    );
  };

  const handleSubmit = async () => {
    const points: number[] = [];

    for (let i = 0; i < currentSet.length; i++) {
      const answer = Number(questions[i].userAnswer);
      if (!Number.isInteger(answer) || answer < 1 || answer > 35) {
	points[i] = 0;
	continue;
      }

      const guessedCapitalIndex = capitalList[answer - 1].index;
      const correctCapitalIndex = currentSet[i].index;

      points[i] = guessedCapitalIndex === correctCapitalIndex ? 1 : 0;
    }

    const score = points.reduce((sum, val) => sum + val, 0);

    setScoreResult("score = " + score);
    setCaption("Score: " + score);

    setCaptionColor(
      score === 0 ? 'red' :
      score <= 4 ? 'blue' :
      score === 5 ? 'green' :
      'black'
    );
  };

  const handleIntercept = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	miUsedAddrs: await api.getUsedAddresses(),
	miChangeAddr: await api.getChangeAddress(),
	miBeneficiaryAddr: mintBenefAddr,
	miResult: scoreResult
      };

      console.log(body);

      const response = await axios.post('http://localhost:8080/mint', body);

      console.log(response.data);

      const signedTx = await api.signTx(response.data.zkprUnsigned.urspTxBodyHex, true);

      const submitData = await axios.post<{
        submitTxFee: number;
        submitTxId: string;
      }>(
        "http://localhost:8080/add-wit-and-submit",
        {
          awasTxUnsigned: response.data.zkprUnsigned.urspTxBodyHex,
          awasTxWit: signedTx,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(submitData.data);

      setSendStatusC('✅ Minted successfully; token sent.');
      setZkPassResult(response.data.zkprResult)
      setZkpPolicyId(response.data.zkprPolicyId);
      setZkpTknName(response.data.zkprTknName);
      setMintTxRef('Transaction ID: ' + submitData.data.submitTxId);
    } catch (err) {
      console.error('Minting error:', err);
      setSendStatusC('❌ Failed to mint zkPass token.');
    }
  };

  const setOwnAddr = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	oaUsedAddrs: await api.getUsedAddresses()
      };

      console.log(body);

      const response = await axios.post('http://localhost:8080/own-addr', body);

      console.log(response.data);

      setMintBenefAddr(response.data.oaOwnAddress);
    } catch (err) {
      console.log('Can not set to own address');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <section>
	<h1>Capital Cities Quiz</h1>
	<button onClick={generateQuestions}>Generate Questions</button>

	{questions.map((q, i) => (
	  <div key={i} style={{ display: 'flex', marginLeft: '10rem', marginTop: '1rem' }}>
	    <div style={{ width: '200px' }}>{q.country}</div>
	    <input
	      type="number"
	      value={q.userAnswer}
	      onChange={(e) => handleChange(i, e.target.value)}
	    />
	  </div>
	))}

	{questions.length > 0 && (
	  <div>
	    <p style={{ color: captionColor }}>{caption}</p>
	    <button style={{ marginTop: '1rem' }} onClick={handleSubmit}>
	      Submit
	    </button>
	    <button style={{ marginLeft: '1rem' }} onClick={handleIntercept}>
	      ZkPass Mint
	    </button>
	  </div>
	)}
	{zkPassResult && <p style={{ marginTop: '1rem' }}><b>zkPassResult: {zkPassResult}</b>{" (\"" + scoreResult + "\")"}</p>}
      </section>

      <section>
	<h2 style={{ marginTop: '3rem' }}>Capital Cities List</h2>
	<ol
	  style={{
	    display: 'grid',
	    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
	    gap: '0.5rem 2rem',
	    listStylePosition: 'inside',
	    paddingLeft: 0,
	  }}
	>
	  {capitalList.map((object, index) => (
	    <li key={index}>{object.capital}</li>
	  ))}
	</ol>
      </section>

      <section>
	<h2 style={{ marginTop: '3rem' }}>zkPass Data</h2>
	<div>
	  <label>
	    <input
	      type="radio"
	      name="wallet"
	      value="lace"
	      checked={selectedWallet === "lace"}
	      onChange={(e) => setSelectedWallet(e.target.value)}
	    />
	    Lace
	  </label>
	  <label>
	    <input
	      type="radio"
	      name="wallet"
	      value="eternl"
	      checked={selectedWallet === "eternl"}
	      onChange={(e) => setSelectedWallet(e.target.value)}
	    />
	    Eternl
	  </label>
	</div>
	<div>
	  <input
	    type="text"
	    placeholder="zkPass token recipient (address)"
	    value={mintBenefAddr}
	    onChange={(e) => setMintBenefAddr(e.target.value)}
	    style={{ width: '60%' }}
	  />
	  <span style={{ marginLeft: '1rem' }}>zkPass token recipient</span>
	  <button onClick={setOwnAddr} style={{ marginLeft: '2rem' }}>Self</button>
	</div>
        {sendStatusC && <p style={{ marginTop: '1rem', color: sendStatusC.startsWith('✅') ? 'green' : 'red' }}>{sendStatusC}</p>}
	{mintTxRef && <p>{mintTxRef}</p>}
	{sendStatusC.startsWith('✅') ? (
	  <>
	    <p>zkPass Token:</p>
	    <p style={{ marginTop: '-0.5rem', marginLeft: '1rem'}}>policy Id: {zkpPolicyId}</p>
	    <p style={{ marginTop: '-0.5rem', marginLeft: '1rem'}}>token name: {zkpTknName}</p>
	  </>
	) : null}
	  
      </section>

    </div>
  );
}

export default App;
