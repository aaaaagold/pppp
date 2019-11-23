const baseTime=new Date().getTime();
// divs
const currPitchDelta=q.ge("currPitchDelta");
// divs end
//const keys=['A','S','E','D','R','F','G','Y','H','U','J','I','K','L']; // until ver. @ 2019/11/04
const keys=[
	'Z','X','D','C','F','Q','2','W', // Mi ... Si
	'E','4','R','5','T','Y','7','U','8','I','9','O','P', // Do ... Do
	189,'V','G','B','N','J','M','K', // Do# ...
]; // dev.er setting
const Hz440id=keys.indexOf('I'); // dev.er setting
const keysOri=[]; for(let x=0;x!==keys.length;++x) keysOri[x]=keys[x];
	for(let x=keys.length;x--;) if(typeof keys[x]==="string") keys[x]=keys[x].charCodeAt();
const keysDown=[]; keysDown.length=keys.length;
const keysRecover=[]; keysRecover.length=keys.length;
const volumes=[]; for(let x=0;x<keys.length;++x) volumes.push(0);
	volumes.max=1<<16; // max val of volume
	volumes.global=0.125/volumes.max; // (a ratio) / (resize to 0..1)
const freqs=[]; for(let x=0;x<keys.length;++x) freqs.push(Math.pow(2,(x-Hz440id)/12.0)*440);
freqs.delta=0;
currPitchDelta.onchange=()=>{
	let tmp=currPitchDelta.value.match(/-?[0-9]+/);
	if(tmp!==null) freqs.change_to(parseInt(tmp[0]));
};
freqs._change_common=()=>{
	oscillators.resetFreq();
	currPitchDelta.value=freqs.delta;
};
freqs.change_to=(n)=>{ freqs.delta=n; freqs._change_common(); };
freqs.change_delta=(n)=>{ freqs.delta+=n; freqs._change_common(); };
console.log(freqs[Hz440id]); // debug

// Edge // BEG
const __first__audioContext=new AudioContext();
const __ori__GainNode=GainNode;
const __ori__OscillatorNode=OscillatorNode;
GainNode=(()=>{
	try{
		new GainNode(__first__audioContext);
	}catch(e){
		let rtv=function(audioctx,conf){
			let tmp=audioctx.createGain();
			for(let i in conf) tmp[i].value=conf[i];
			return tmp;
		};
		return rtv;
	}
	return GainNode;
})();
OscillatorNode=(()=>{
	try{
		new OscillatorNode(__first__audioContext);
	}catch(e){
		let rtv=function(audioctx,conf){
			let tmp=audioctx.createOscillator();
			for(let i in conf) tmp[i].value=conf[i];
			return tmp;
		};
		return rtv;
	}
	return OscillatorNode;
})();
// Edge // END

let audioCtxs = [];
let audioCtx = new AudioContext();
let gainNodes = [];
let oscillators = [];
	oscillators.resetFreq=()=>{
		let r=Math.pow(2,freqs.delta/12.0);
		for(let x=0;x!==oscillators.length;++x) oscillators[x].frequency.value=freqs[x]*r;
		return;
	};
for(let x=0;x!==keys.length;++x){
	//let audioCtx = new AudioContext();
	audioCtxs.push(audioCtx);
	
	let gainNode = new GainNode(audioCtx,{gain:0});
	gainNode.connect(audioCtx.destination);
	gainNodes.push(gainNode);
	
	let oscillator = new OscillatorNode(audioCtx,{detune:0,frequency:freqs[x],type:"triangle"});
	oscillator.connect(gainNode);
	oscillators.push(oscillator);
}
for(let x=0;x!==oscillators.length;++x) oscillators[x].start(0);

let keydown=(id)=>{
	let alreadyDown=keysDown[id];
	keysDown[id]=1;
	
	if(audioCtxs[id].state==="suspended") audioCtxs[id].resume();
	if(keysRecover[id]){ clearInterval(keysRecover[id]); keysRecover[id]=0; }
	if(!alreadyDown){
		gainNodes[id].gain.value=(volumes[id]=volumes.max)*volumes.global;
		seq.push([id-Hz440id,"down",new Date().getTime()-baseTime]);
	}
};
let keyup=(id)=>{
	keysDown[id]=0;
	
	//gainNodes[id].gain.value =-> 0;
	let itvl=setInterval(function(){
		let val=volumes[id];
		//val-=0.0078125;
		//val=parseInt(val*0.984375);
		val=parseInt(val*0.9375);
		if(val<1e-4){ keysRecover[id]=0; gainNodes[id].gain.value=volumes[id]=val=0; clearInterval(itvl); }
		if(!keysDown[id]) gainNodes[id].gain.value=(volumes[id]=val)*volumes.global;
	},16);
	keysRecover[id]=itvl;
	seq.push([id-Hz440id,"up",new Date().getTime()-baseTime]);
};

let seq=[]; // [[delta number of 2**(1/12) to Hz440,"up" or "down",timing,is_use_delta]]
let lastInput=[];
let seqs=[]; // array of seq, appended when clear
let seq_abs2dlt=(seq)=>{
	if(!seq.length) return [];
	let rtv=[[seq[0][0],seq[0][1],100,1]];
	for(let x=1;x!==seq.length;++x) rtv.push([seq[x][0],seq[x][1],(seq[x][2]-seq[x-1][2]),1]);
	return rtv;
};
let seq_dlt2abs=(seq,baseTime)=>{
	if(!seq.length) return [];
	if(!baseTime) baseTime|=0;
	let rtv=[[seq[0][0],seq[0][1],baseTime]];
	for(let x=1;x!==seq.length;++x) rtv.push([seq[x][0],seq[x][1],(seq[x][2]+rtv[x-1][2])]);
	return rtv;
};
let seq_mix2abs=(seq)=>{
	// baseTime===0
	if(!seq.length) return [];
	let rtv=[[seq[0][0],seq[0][1],seq[0][2],]];
	for(let x=1;x!==seq.length;++x)
	{
		let tmp=[seq[x][0],seq[x][1],seq[x][2]];
		if(seq[x][3]) tmp[2]+=rtv[x-1][2];
		rtv.push(tmp);
	}
	rtv.sort((a,b)=>{return a[2]-b[2];});
	return rtv;
};
let putseq=(ele,seq)=>{
	// directly put (replacing original text)
	ele.ra(0).at(JSON.stringify(seq));
};
let stopseq=1;
let queuingseq={},queuingseq_serial=0;
let playseq=(seq)=>{
	if(!seq.length) return;
	stopseq&=0;
	seq=seq_mix2abs(seq);
	let baseTime=seq[0][2],basefoo=()=>{};
	let playone=(kid,upordown)=>{
		if(stopseq) return;
		let foo=basefoo;
		if(upordown==="down") foo=keydown;
		if(upordown==="up") foo=keyup;
		foo(kid);
	};
	let prepare=(sid,baseTime)=>{
		if(stopseq|(sid===seq.length)){ console.log("seq end"); return; }
		//let nextTime=(("string"===typeof seq[sid][2])&&seq[sid][2][0]==="+")?parseInt(seq[sid][2]):(seq[sid][2]-baseTime);
		let nextTime=(seq[sid][2]-(1^seq[sid][3])*baseTime);
		let kid=seq[sid][0]+Hz440id;
		let upordown=seq[sid][1];
		let serial=queuingseq_serial; ++queuingseq_serial; queuingseq_serial&=0xffff;
		let x=setTimeout(()=>{
			delete queuingseq[serial];
			playone(kid,upordown);
			prepare(sid+1,baseTime+nextTime);
		},nextTime);
		queuingseq[serial]=x;
	};
	prepare(0,baseTime);
};
playseq.stop=()=>{
	stopseq|=1;
	for(let x=0;x!==keysDown.length;++x) if(keysDown[x]) keyup(x);
	for(let i in queuingseq) clearTimeout(queuingseq[i]);
};

let io_keydown=((evt)=>{
	//if(evt.isComposing){return;}
	let key=evt.keyCode;
	let id=keys.indexOf(key);
	if(id===-1){
		// alt functions
		switch(key)
		{
		default:
			break;
		// pitch higher / lower
		case 38:
			freqs.change_delta(1);
			break;
		case 40:
			freqs.change_delta(-1);
			break;
		}
		return;
	}
	
	keydown(id);
}),io_keyup=((evt)=>{
	//if(evt.isComposing){return;}
	let key=evt.keyCode;
	let id=keys.indexOf(key);
	if(id===-1){
		return;
	}
	
	keyup(id);
});
