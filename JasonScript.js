window.onload=function() {
	canv=document.getElementById("gc");
	ctx=canv.getContext("2d");
	setInterval(game,1000/5);
}
px=py=10;
gs=tc=20;
ax=ay=15;
xv=yv=0;
trail=[];
tail = 1;
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
	ctx.fillRect(0,0,canv.width,canv.height);

	ctx.fillStyle="cyan";
	for(var i=0;i<trail.length;i++) {
		ctx.fillRect(trail[i].x*gs,trail[i].y*gs,gs-2,gs-2);
		if(trail[i].x==px && trail[i].y==py) {
			tail = 1;
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
}
/*
gc.onclick = function pressed(event){
   var mx = event.clientX;
   var my = event.clientY;
  if(mx > 200 && xv ==0){
    yv=0;
    xv=1;
  }
  else if(mx < 200 && xv ==0){
    yv=0;
    xv=-1;
  }
  else if(my > 200 && yv ==0){
    yv=1;
    xv=0;
  }
  else if(my < 200 && yv ==0){
    yv=-1;
    xv=0;
  }
}
*/
gc.ontouchstart = function tooched(event){
   var mx = event.touches[0].screenX;
   var my = event.touches[0].screenY;
  if(mx > 200 && xv ==0){
    yv=0;
    xv=1;
  }
  else if(mx < 200 && xv ==0){
    yv=0;
    xv=-1;
  }
  else if(my > 200 && yv ==0){
    yv=1;
    xv=0;
  }
  else if(my < 200 && yv ==0){
    yv=-1;
    xv=0;
  }
}
