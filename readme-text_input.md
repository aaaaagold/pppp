# text input format
an input is a ***sequence*** consisting several ***basic element***s

## basic element format
***[pitch , key_down or key_up , time in miliseconds , using delta representation]***
* pitch: An integer number n, sound freqency = (2^(1.0/12))^n * 440 Hz, **Notice**. Check ```freqs.length``` and ```Hz440id``` to know the valid range
* key_down or key_up: Literally meaning an operation of key down or key up. Use string "down" and "up" to represent key_down or key_up. **Other than those take no effect** so you can **do nothing**.
* time in miliseconds: the time in miliseconds, the first operation's time will be shifted to 0; i.e. the first operation will start immediately.
* using delta representation: if the value in 'if' can be true, 'time in miliseconds' will mean the difference between **previous** operation. else 'time in miliseconds' will mean the difference between **the first** operation.

## sequence
your input should look like one of the folloing

### absolute format
* example 1

```
[[-2,"down",100],[-2,"up",200],[-5,"down",300],[-5,"up",400],[-5,"down",500],[-5,"up",600],[0,"none",700],[-4,"down",800],[-4,"up",900],[-7,"down",1000],[-7,"up",1100],[-7,"down",1200],[-7,"up",1300]]
```

 // first operation's time will be shifted to 0 => all time will minus first's time

 // equals to
```
[[-2,"down",0],[-2,"up",100],[-5,"down",200],[-5,"up",300],[-5,"down",400],[-5,"up",500],[0,"none",600],[-4,"down",700],[-4,"up",800],[-7,"down",900],[-7,"up",1000],[-7,"down",1100],[-7,"up",1200]]
```

* example 2

```
[[-9,"down",100],[-9,"up",200],[-9,"down",300],[-9,"up",400],[-2,"down",500],[-2,"up",600],[-2,"down",700],[-2,"up",800],[0,"down",900],[0,"up",1000],[0,"down",1100],[0,"up",1200],[-2,"down",1300],[-2,"up",1400]]
```


### delta format
* example 1

```
[[-2,"down",100,1],[-2,"up",100,1],[-5,"down",100,1],[-5,"up",100,1],[-5,"down",100,1],[-5,"up",100,1],[0,"none",100,1],[-4,"down",100,1],[-4,"up",100,1],[-7,"down",100,1],[-7,"up",100,1],[-7,"down",100,1],[-7,"up",100,1]]
```

 // first operation's time will be shifted to 0 => all time will minus first's time
 
 // equals to
```
[[-2,"down",0,1],[-2,"up",100,1],[-5,"down",100,1],[-5,"up",100,1],[-5,"down",100,1],[-5,"up",100,1],[0,"none",100,1],[-4,"down",100,1],[-4,"up",100,1],[-7,"down",100,1],[-7,"up",100,1],[-7,"down",100,1],[-7,"up",100,1]]
```

* example 2

```
[[-9,"down",100,1],[-9,"up",100,1],[-9,"down",100,1],[-9,"up",100,1],[-2,"down",100,1],[-2,"up",100,1],[-2,"down",100,1],[-2,"up",100,1],[0,"down",100,1],[0,"up",100,1],[0,"down",100,1],[0,"up",100,1],[-2,"down",100,1],[-2,"up",100,1]]
```

### mixed format
// use ```[0,"none",0]``` to specify that the following is **starting from time=0** because "none" is neither "down" nor "up".

// add ```[0,"none",0]``` at the end of sequence so each line can add a ',' at the end of the line. take copy-paste convenience.

```
[

[0,"none",0],
[-2,"down",100,1],[-2,"up",100,1],[-5,"down",100,1],[-5,"up",100,1],[-5,"down",100,1],[-5,"up",100,1],[0,"none",100,1],[-4,"down",100,1],[-4,"up",100,1],[-7,"down",100,1],[-7,"up",100,1],[-7,"down",100,1],[-7,"up",100,1],
[0,"none",100,1],

[0,"none",0],
[-9,"down",100,1],[-9,"up",100,1],[-9,"down",100,1],[-9,"up",100,1],[-2,"down",100,1],[-2,"up",100,1],[-2,"down",100,1],[-2,"up",100,1],[0,"down",100,1],[0,"up",100,1],[0,"down",100,1],[0,"up",100,1],[-2,"down",100,1],[-2,"up",100,1],
[0,"none",100,1],

[0,"none",0]

]
```
