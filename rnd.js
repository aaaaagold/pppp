if(!Array.concat) Array.concat=function(arr){
	if(!arr.length)return;
	let rtv=JSON.parse(JSON.stringify(this));
	let dup=JSON.parse(JSON.stringify(arr));
	for(let x=0;x!==dup.length;++x) rtv.push(dup[x]);
	return rtv;
};
let rnd=(cnt,delay,clip)=>{
	if(cnt===undefined) cnt=11;
	if(clip===undefined) clip=[-Hz440id,freqs.length-1-Hz440id];
	if(delay===undefined || "number"!==typeof delay || isNaN(delay)) delay=100;
	let rtv=[],clip_min=clip[0],clip_max=clip[1];
	let lastpitch,dir,samedircnt=0;
	for(let x=cnt;x--;)
	{
		let hzid=parseInt(Math.random()*12)-(Hz440id-9); // Do~
		let r=Math.random()<0.5*Math.pow(2,-samedircnt); samedircnt+=r; samedircnt*=r;
		if(dir!==undefined  && r)
		{
			hzid+=dir;
		}
		else if(lastpitch!==undefined && Math.random()<0.5) hzid=parseInt(hzid+lastpitch)>>1;
		if(hzid!==undefined && hzid<clip_min) hzid=clip_min;
		if(hzid!==undefined && hzid>clip_max) hzid=clip_max;
		if(lastpitch!==undefined) dir=hzid-lastpitch;
		lastpitch=hzid;
		rtv.push([hzid,"down",delay,1]);
		rtv.push([hzid,"up",delay,1]);
	}
	return rtv;
};
let megarnd=(rndres)=>{
	// TODO
	let rtv=[];
	for(let x=3;x--;)
		rtv=rtv.concat(rndres).concat(shift(rndres,6)).concat(rndres).concat([[0,"none",1000,1]]);
	return rtv;
};
let shift=(arr,delta,clip)=>{
	if(clip===undefined) clip=[-Hz440id,freqs.length-1-Hz440id];
	let rtv=[],clip_min=clip[0],clip_max=clip[1];
	for(let x=0;x!==arr.length;++x)
	{
		let tmp=[]; for(let i=0;i!==arr[x].length;++i) tmp.push(arr[x][i]);
		tmp[0]+=delta;
		if(clip_min!==undefined && tmp[0]<clip_min) tmp[0]=clip_min;
		if(clip_max!==undefined && tmp[0]>clip_max) tmp[0]=clip_max;
		rtv.push(tmp);
	}
	return rtv;
};
