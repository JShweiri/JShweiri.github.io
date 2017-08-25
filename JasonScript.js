
window.onload=function(){
var canv = document.getElementById("canvas");
var ctx = canv.getContext("2d");
setInterval(game, 1000/15);
}

px=py=5;
gs=tc=20;
ax=ay=15;
xv=yv=0;
trail[];
tail = 1;

function game(){
  px+=xv;
  py+=yv;
  if(px>tc-1){
    px = 0;
  }
  if(px<0){
    px = tc-1;
  }
  if(py>tc-1){
    py = 0;
  }
  if(py<0){
    py = tc-1;
  }
ctx.fillStyle="black";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="Cyan";
for (var i = 0; i<trail.length; i++){
  ctx.fillRect(trail[i].x*gs, trail[i].y*gs, gs-2, gs-2);
  if(trail[i].x == px && trail[i].y == py){
    tail = 1;
    //Gameover Stuff
  }
}
trail.push({x:px, y:py});
while(trail.length>tail){
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

canv.onclick = function(){
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
}
