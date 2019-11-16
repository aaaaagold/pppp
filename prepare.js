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
const freqs=[]; for(let x=0;x<keys.length;++x) freqs.push(Math.pow(2,(x-Hz440id)/12.0)*440);
freqs.delta=0;
currPitchDelta.onchange=()=>{
	let tmp=currPitchDelta.value.match(/-?[0-9]+/);
	if(tmp!==null) freqs.change_to(parseInt(tmp[0]));
};
freqs._change_common=()=>{
	oscillators.reset();
	currPitchDelta.ra(0).at(""+freqs.delta);
};
freqs.change_to=(n)=>{ freqs.delta=n; freqs._change_common(); };
freqs.change_delta=(n)=>{ freqs.delta+=n; freqs._change_common(); };
console.log(freqs[Hz440id]); // debug

let audioCtxs = [];
let gainNodes = [];
let oscillators = [];
	oscillators.reset=()=>{
		let r=Math.pow(2,freqs.delta/12.0);
		for(let x=0;x!==oscillators.length;++x){
			let oscillator = new OscillatorNode(audioCtxs[x],{detune:0,frequency:freqs[x]*r,type:"triangle"});
			oscillator.start(0);
			oscillators[x].disconnect(gainNodes[x]);
			oscillator.connect(gainNodes[x]);
			oscillators[x]=oscillator;
		}
	};
for(let x=0;x!==keys.length;++x){
	let audioCtx = new AudioContext();
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
		gainNodes[id].gain.value=1;
		seq.push([id-Hz440id,"down",new Date().getTime()-baseTime]);
	}
};
let keyup=(id)=>{
	keysDown[id]=0;
	
	//gainNodes[id].gain.value=0;
	let itvl=setInterval(function(){
		let val=gainNodes[id].gain.value;
		//val-=0.0078125;
		val*=0.984375;
		if(val<1e-4){ keysRecover[id]=0; val=0; clearInterval(itvl); }
		if(!keysDown[id]) gainNodes[id].gain.value=val;
	},1);
	keysRecover[id]=itvl;
	seq.push([id-Hz440id,"up",new Date().getTime()-baseTime]);
};

let seq=[]; // [[delta number of 2**(1/12) to Hz440,up_or_down,timing,use_delta?]]
let lastInput=[];
let seqs=[]; // array of seq, appended when clear
let stopseq=1;
let queuingseq={},queuingseq_serial=0;
let playseq=(seq)=>{
	if(!seq.length) return;
	stopseq&=0;
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
			currPitchDelta.value=parseInt(currPitchDelta.value)+1;
			break;
		case 40:
			freqs.change_delta(-1);
			currPitchDelta.value=parseInt(currPitchDelta.value)-1;
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
