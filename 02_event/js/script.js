$(function(){
$(".btn1").click(function(){
$(".parent .box1").hide()    
})

 $("#btn2").click(function(){
  $(".parent .box1").show()
 })
$("#btn3").click(function(){
 $(".box2").toggle()   
})

$("#btn4").click(function(){
  $(".box3").width(400)
  $(".box3").height(400)    
})

$("#btn5").click(function(){
 $(".box3").width(200)
 $(".box3").height(200)    
})
})