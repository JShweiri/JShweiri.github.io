var mobile =false;
px=py=10;
gs=tc=25;
ax=ay=15;
xv=yv=0;
trail=[];
tail = 0;


window.onload=function() {
	canv=document.getElementById("gc");
	canv.width=(gs*tc);
	canv.height=(gs*tc);
	ctx=canv.getContext("2d");
	setInterval(game,1000/5);
}
function game() {
	px+=xv;
	py+=yv;
	if(px<0) {
		px= tc-1;
	}
	if(px>tc-1) {
		px= 0;
	}
	if(py<0) {
		py= tc-1;
	}
	if(py>tc-1) {
		py= 0;
	}
	ctx.fillStyle="black";
	ctx.fillRect(0,0,gs*tc,gs*tc);

	ctx.fillStyle="cyan";
	ctx.fillRect(px*gs,py*gs,gs-2,gs-2);
	for(var i=0;i<trail.length;i++) {
		ctx.fillRect(trail[i].x*gs,trail[i].y*gs,gs-2,gs-2);
		if(trail[i].x==px && trail[i].y==py) {
			tail = 0;
		}
	}
	trail.push({x:px,y:py});
	while(trail.length>tail) {
	trail.shift();
	}

	if(ax==px && ay==py) {
		tail++;
		ax=Math.floor(Math.random()*tc);
		ay=Math.floor(Math.random()*tc);
	}
	ctx.fillStyle="yellow";
	ctx.fillRect(ax*gs,ay*gs,gs-2,gs-2);
	document.getElementById("score").innerHTML = "Score: " + tail;
}

gc.addEventListener('touchstart', function(e){
mobile = true;
var touchobj = e.changedTouches[0];
var mx = parseInt(touchobj.clientX);
var my = parseInt(touchobj.clientY);
if(mobile){
if(mx > (gs*tc)/2.0 && xv ==0){
	yv=0;
	xv=1;
}
else if(mx < (gs*tc)/2.0 && xv ==0){
	yv=0;
	xv=-1;
}
else if(my > (gs*tc)/2.0 && yv ==0){
	yv=1;
	xv=0;
}
else if(my < (gs*tc)/2.0 && yv ==0){
	yv=-1;
	xv=0;
}
}
}, false)

gc.onclick = function pressed(event){
   var mx = event.clientX;
   var my = event.clientY;
	 if(!mobile){
  if(mx > (gs*tc)/2.0 && xv ==0){
    yv=0;
    xv=1;
  }
  else if(mx < (gs*tc)/2.0 && xv ==0){
    yv=0;
    xv=-1;
  }
  else if(my > (gs*tc)/2.0 && yv ==0){
    yv=1;
    xv=0;
  }
  else if(my < (gs*tc)/2.0 && yv ==0){
    yv=-1;
    xv=0;
  }
}
}
