// The entry file of your WebAssembly module.

// file:///E:/work/develop/2023/bmas/index.html

// npm run asbuild  [ or  npm run asbuild:release ]
// npm test ??

// E:\winprg\PortableApps.com\PortableApps\GoogleChromePortable\GoogleChromePortable.exe -disable-web-security --disable-gpu --user-data-dir=E:\tmp\chromeTemp

/*
export function add(a: i32, b: i32): number {
  //const t1 = i64(performance.now());
  //const t1: f64 = performance.now();
  const t1 = Date.now();
  const sum = a + b;
  const t2 = Date.now();
  const tDiff = t2 - t1;

  //return a + b;
  return f64(tDiff);
}
*/


//
// bench00 (Integer 16 bit)
// (sum of 1..n) % 65536
//
export function bench00(loops: i32, n: i32, check: i32): i32 {
	const	nDiv65536 = (n >> 16),
		nMod65536 = (n & 0xffff);
		//i: i32, j: i32;
  let x = 0;

	while (loops-- > 0 && x === 0) {
		for (let i = nDiv65536; i > 0; i--) {
			for (let j = 32767; j > 0; j--) {
				x += j;
			}
			for (let j = -32768; j < 0; j++) {
				x += j;
			}
		}
		for (let j = nMod65536; j > 0; j--) {
			x += j;
		}
		x &= 0xffff;
		x -= check;
	}
	return x & 0xffff;
}


/* 
// orig:
export function bench00_orig(loops: i32, n: i32, check: i32): i32 {
	var x: i32 = 0,
		nDiv65536 = (n >> 16),
		nMod65536 = (n & 0xffff),
		i: i32, j: i32;

	while (loops-- > 0 && x === 0) {
		for (i = nDiv65536; i > 0; i--) {
			for (j = 32767; j > 0; j--) {
				x += j;
			}
			for (j = -32768; j < 0; j++) {
				x += j;
			}
		}
		for (j = nMod65536; j > 0; j--) {
			x += j;
		}
		x &= 0xffff;
		x -= check;
	}
	return x & 0xffff;
}
*/


//
// bench01 (Integer 32 bit)
// (arithmetic mean of 1..n)
// (to avoid numbers above 2*n, divide by n using subtraction)
// bench01(loops, 1000000, (1000000 + 1) / 2) | 0)
//
export function bench01(loops: i32, n: i32, check: i32): i32 {
	var x = 0,
		sum = 0,
		i: i32;

	while (loops-- > 0 && x === 0) {
		sum = 0;
		for (i = 1; i <= n; i++) {
			sum += i;
			if (sum >= n) {
				sum -= n;
				x++;
			}
		}
		x -= check;
	}
	return x;
}


//
// bench02 (Floating Point, normally 64 bit)
// (arithmetic mean of 1..n)
export function bench02(loops: i32, n: i32, check: i32): i32 {
	var x: i32 = 0,
		sum: f64 = 0.0,
		i: i32;

	while (loops-- > 0 && x === 0) {
		sum = 0.0;
		for (i = 1; i <= n; i++) {
			sum += i;
			if (sum >= n) {
				sum -= n;
				x++;
			}
		}
		x -= check;
	}
	return x;
}

/*
test:
export function bench02(loops: i32, n: i32, check: i32): i32 {
	var x: i32 = 0,
		sum: f64 = 0.0,
		i: f64,
    nf: f64 = f64(n);

	while (loops-- > 0 && x === 0) {
		sum = 0.0;
		for (i = 1; i <= nf; i++) {
			sum += i;
			if (sum >= nf) {
				sum -= nf;
				x++;
			}
		}
		x -= check;
	}
	return x;
}
*/

//
// bench03 (Integer)
// number of primes less than or equal to n (prime-counting function)
// Example: n=500000 => x=41538 (expected), n=1000000 => x=78498
// (Sieve of Eratosthenes, no multiples of 2's are stored)
export function bench03(loops: i32, n: i32, check: i32): i32 {
	let x = 0; // number of primes below n
	//let i: i32, j: i32, m: i32;

	n = (n / 2) | 0; // compute only up to n/2
	const nHalf = n >> 1; // div 2

	//sieve1 = gState.hasUint8Array ? new Uint8Array(nHalf + 1) : new Array(nHalf + 1); // set the size we need, only for odd numbers
  //const sieve1 = new Uint8Array(nHalf + 1); // set the size we need, only for odd numbers
  const sieve1 = new StaticArray<bool>(nHalf + 1); // set the size we need, only for odd numbers

	// gState.fnLog("DEBUG: nHalf=" + (nHalf) + ", sieve1.length=" + sieve1.length);
	while (loops-- > 0 && x === 0) {
		// initialize sieve
    /*
		for (i = 0; i <= nHalf; i++) {
			unchecked(sieve1[i] = false); // odd numbers are possible primes
		}
    */
    sieve1.fill(false);

		// compute primes
		let i: i32 = 0;
		let m: i32 = 3;
		x++; // 2 is prime
		while (m * m <= n) {
			if (!unchecked(sieve1[i])) {
				x++; // m is prime
				let j: i32 = (m * m - 3) >> 1; // div 2
				while (j < nHalf) {
					unchecked(sieve1[j] = true);
					j += m;
				}
			}
			i++;
			m += 2; // or: =2 * i + 3;
		}

		// count remaining primes
		while (m <= n) {
			if (!unchecked(sieve1[i])) {
				x++; // m is prime
			}
			i++;
			m += 2;
		}
		x -= check;
	}
	return x;
}



//
// bench04 (Integer 32 bit)
// nth random number number
// Random number generator taken from
// Raj Jain: The Art of Computer Systems Performance Analysis, John Wiley & Sons, 1991, page 442-444.
// (or: https://www.cse.wustl.edu/~jain/cse567-08/ftp/k_26rng.pdf 26.21, Example 26.3; q=127773; 26.45)
// It needs longs with at least 32 bit.
// Starting with x0=1, x10000 should be 1043618065, x1000000 = 1227283347
export function bench04(loops: i32, n: i32, check: i32): i32 {
	let m = 2147483647, // prime number 2^31-1; modulus, do not change!
		a = 16807, // 7^5, one primitive root; multiplier
		q = 127773, // m div a
		r = 2836, // m mod a
		x = 0, // random value
		i: i32;

	while (loops-- > 0 && x === 0) {
		x++; // start with 1=last random value
		for (i = 0; i < n; i++) {
			x = a * (x % q) - r * ((x / q) | 0); // x div q
			if (x <= 0) {
				x += m; // x is new random number
			}
		}
		x -= check;
	}
	return x;
}


//
// bench05 (Integer 32 bit)
// n over n/2 mod 65536 (Pascal's triangle)
//
export function bench05(loops: i32, n: i32, check: i32): i32 {
	let x: i32 = 0;

	n = (n / 500) | 0; // compute only up to n/500

	let k: i32 = (n / 2) | 0; // div 2
	if ((n - k) < k) {
		k = n - k; // keep k minimal with  n over k  =  n over n-k
	}

	//line = gState.hasUint16Array ? new Uint16Array(k + 1) : new Array(k + 1);
	let line = new StaticArray<i32>(k + 1); 
	//lastLine = gState.hasUint16Array ? new Uint16Array(k + 1) : new Array(k + 1);
	let lastLine = new StaticArray<i32>(k + 1); 
	//unchecked(line[0] = 1);
	//unchecked(lastLine[0] = 1);

	while (loops-- > 0 && x === 0) {
		// initialize
		/*
		for (j = 1; j <= k; j++) {
			unchecked(line[j] = 0);
			unchecked(lastLine[j] = 0);
		}
		*/
		line.fill(0);
		lastLine.fill(0);
		unchecked(line[0] = 1);
		unchecked(lastLine[0] = 1);
	
		// compute
		for (let i = 3; i <= n; i++) {
			let min1 = (i - 1) >> 1;
			if (k < min1) {
				min1 = k;
			}
			unchecked(line[1] = i); // second column is i
			for (let j = 2; j <= min1; j++) {
				unchecked(line[j] = (lastLine[j - 1] + lastLine[j]) & 0xffff); // for Uint16Array we could skip the & 0xffff but not for Array
			}
			if ((min1 < k) && ((i & 1) === 0)) { // new element
				unchecked(line[min1 + 1] = 2 * lastLine[min1]);
			}

			const tempLine = lastLine;
			lastLine = line;
			line = tempLine;
		}

		unchecked(x += lastLine[k] & 0xffff);
		x -= check;
	}
	return x;
}


/*
export function testBench00(): i32 {
  const loops = 100;
  const n = 1000000;
  const check = ((n / 2) * (n + 1)) % 65536;
  return bench00(loops, n, check);
}
*/
