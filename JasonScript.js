window.onload=function() {
	canv=document.getElementById("gc");
	ctx=canv.getContext("2d");
	canv.addEventListener("onclick",pressed);
	setInterval(game,1000/15);
}
px=py=10;
gs=tc=20;
ax=ay=15;
xv=1;
yv=0;
trail=[];
tail = 5;
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

	ctx.fillStyle="lime";
	for(var i=0;i<trail.length;i++) {
		ctx.fillRect(trail[i].x*gs,trail[i].y*gs,gs-2,gs-2);
		if(trail[i].x==px && trail[i].y==py) {
			tail = 5;
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
	ctx.fillStyle="red";
	ctx.fillRect(ax*gs,ay*gs,gs-2,gs-2);
}

 function pressed(){
  if(event.clientX > 200 && xv ==0){
    yv=0;
    xv=1;
  }
  if(event.clientX < 200 && xv ==0){
    yv=0;
    xv=-1;
  }
  if(event.clientY > 200 && yv ==0){
    yv=1;
    xv=0;
  }
  if(event.clientY < 200 && yv ==0){
    yv=-1;
    xv=0;
  }
}
