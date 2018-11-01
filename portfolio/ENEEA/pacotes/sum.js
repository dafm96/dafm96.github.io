window.onload=function(){
var inputs = document.getElementsByClassName('sumBase'),
    total  = document.getElementById('total-base');

 for (var i=0; i < inputs.length; i++) {
    inputs[i].onchange = function() {
        var add = this.value * (this.checked ? 1 : -1);
        total.innerHTML = parseFloat(total.innerHTML) + add
        var new_total = parseFloat(document.getElementById('input').value);
      console.log(new_total);
        document.getElementById('input').value=new_total + add
    }
  };
    
    var inputs2 = document.getElementsByClassName('sumf'),
    total2  = document.getElementById('total-f');

 for (var i=0; i < inputs2.length; i++) {
    inputs2[i].onchange = function() {
        var add = this.value * (this.checked ? 1 : -1);
        total2.innerHTML = parseFloat(total2.innerHTML) + add
        var new_total = parseFloat(document.getElementById('input').value);
      console.log(new_total);
        document.getElementById('input').value=new_total + add
    }
  }
}