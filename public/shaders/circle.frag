/**
* circle.frag
* This draws a circle with 3 arrows from the center point.
* 
* PlastMan420
* 31/12/2025 
*/
#version 300 es
#define M_PI 3.1415926535897932384626433832795

precision highp float;

out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec3 u_timeInput;// (hour, minute, second)

float strokeCircle(float radius,float thickness,vec2 uv){
  vec2 center=vec2(.5,.5);
  float dist=distance(uv,center);
  return step(radius-thickness,dist)-step(radius,dist);
}

float lineFromCenter(vec2 p1,vec2 p2,float thickness,vec2 uv){
  vec2 pa=uv-p1;// uv - (.5, .5) = center (.5, .5)
  vec2 ba=p2-p1;// (.5, .82) - (.5, .5) = (0, .32)
  
  // Projection of pa onto ba.
  float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);// = 0.16 / 1 = 0.16
  float dist=length(pa-ba*h);// (.5, .5) - (0, 0.0512) = (0.5, 0.4488) = 0.671
  return step(dist,thickness);
}

vec3 getAngleFromTimeInput(vec3 timeInput){
  float hourAngle=mod(timeInput.x,12.)*30.+(timeInput.y/60.)*30.;// Each hour is 30 degrees + minute contribution
  float minuteAngle=timeInput.y*6.+(timeInput.z/60.)*6.;// Each minute is 6 degrees + second contribution
  float secondAngle=timeInput.z*6.;// Each second is 6 degrees
  
  return vec3(hourAngle,minuteAngle,secondAngle);
}

float angleToRadian(float angleDeg){
  return angleDeg*M_PI/180.;
}

vec3 drawArrow(float angleDeg,float arrowLength,vec3 color,float thickness,vec2 uv){
  vec2 center=vec2(.5,.5);
  float angleDegToAngleRad=angleToRadian(angleDeg);
  vec2 lineEnd=center+vec2(sin(angleDegToAngleRad),cos(angleDegToAngleRad))*arrowLength;
  float lineShape=lineFromCenter(center,lineEnd,thickness,uv);
  return color*lineShape;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;// Normalized coordinates (0 to 1). dependent on resolution.
  vec2 center=vec2(.5,.5);
  
  float radius=.4;
  
  float hoursArrowLength=radius*.6;
  float minutesArrowLength=radius*.8;
  float secondsArrowLength=radius*.9;
  
  vec3 hoursArrowColors=vec3(1.,0.,0.);
  vec3 minutesArrowColors=vec3(0.,1.,0.);
  vec3 secondsArrowColors=vec3(0.,0.,1.);
  
  // Clock Circle
  float circle=strokeCircle(radius,.05,uv);
  
  // Clock Arrows
  vec3 angles=getAngleFromTimeInput(u_timeInput);
  vec3 hoursArrow=drawArrow(angles.x,hoursArrowLength,hoursArrowColors,.02,uv);
  vec3 minutesArrow=drawArrow(angles.y,minutesArrowLength,minutesArrowColors,.015,uv);
  vec3 secondsArrow=drawArrow(angles.z,secondsArrowLength,secondsArrowColors,.01,uv);
  
  vec3 color=vec3(1.,1.,1.)*circle;
  color+=hoursArrow;
  color+=minutesArrow;
  color+=secondsArrow;
  
  vec4 outPutResult=vec4(color,1.);
  
  outPutResult=vec4(color,length(color)==0.?0.:1.);
  
  fragColor=outPutResult;
}
