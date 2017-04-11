$(document).ready(function() {

	var curLoan;
	var curLoanIndex;
	var addrReg; //23.03 marked for deletion
	var loans = []; //24.03 marked for deletion - promises wont let me store loans in a JS variable

	//02.04
	curAcct = web3.eth.defaultAccount;
	$('#intro .cur-acct .result').html('current: ' + curAcct);

	//23.03
	//var dbAd = LoanDB.address;
	//dbAd unnecessary as var dbAddr created in index html

	//02.04
	//set current user account
	$('#intro .cur-acct button').click(function() {
	  curAcct = $('#intro .cur-acct .newAddr').val();
		if (curAcct === "") {
			curAcct = web3.eth.defaultAccount;
		}
		$('#intro .cur-acct .result').html('current: ' + curAcct);
	});

/*	//08.04
	//added indexed account switching
	$('#intro .cur-acct button').click(function() {
		var index = $('#intro .cur-acct .index').val();
		try {
			if (index > 9 || index < 0) throw "index must be between 0-9";
		}
		catch {
			$('#intro .cur-acct .result').html(err);
		}
		if (curAcct === "") {
			curAcct = web3.eth.defaultAccount[index];
		}
		$('#intro .cur-acct .result').html('selected account at index ' + index + '<br />current: ' + curAcct);
	})*/

  //.accts
  $('#intro .accts button').click(function() {
  	$('#intro .accts .result').html('');
  	web3.eth.getAccounts(function(err, accounts) {
  		for(var i = 0; i < accounts.length; i++) {
  			(function(i) {
  				var address = accounts[i];
  				var balance = web3.fromWei(web3.eth.getBalance(accounts[i]));
  				$('#intro .accts .result').append('<br />' + i + ': ' + address + ': ' + balance);
  			})(i);
  		}
  	});
  });

  //02.04
  //add default account setters and getters


  //26.03
  //tx from one address to another test
  //surprise: it works
  //for main accounts only
  // can't fund contracts
  //see below for attempt to fund contracts

  //02.04 experimentation
  $('#intro .tx button').click(function() {
  	var amt = web3.toWei($('#intro .tx .amt').val());
  	var tgt = $('#intro .tx .tgt').val();
  	//var frm = $('#intro .tx .frm').val();
  	//uses accounts[0] if frm is undefined
/*  	if (frm === "") {
  		alert('hello');
  		var accts = web3.eth.accounts;
  		frm = accts[0];
  	}*/
  	web3.eth.sendTransaction({from: curAcct, to: tgt, value: amt}, function(err, result) {
  		$('#intro .tx .result').html('sent: ' + web3.fromWei(amt, 'ether') + ' ether<br />from ' + frm + ' <br />tgt ' + tgt);
  	});
  });

  //02.04
  //integrated with curAcct
  $('#intro .send-brw button').click(function() {
  	var loan = $('#intro .send-brw .loan').val();
  	var tgt = $('#intro .send-brw .tgt').val();

  	if (tgt === "") {
  		tgt = curAcct;
  	}

 	  curLoan = new EmbarkJS.Contract({
			abi: Loan.abi,
			address: loan
		});

		var balance = web3.fromWei(web3.eth.getBalance(loan), 'ether');

		//first attempt
		//cahnged tgt to curAcct
 	  curLoan.sendToBorrower({from: tgt}).then(function(success) {
 	  	if (success) {
 	  		$('#intro .send-brw .result').html('' + balance + ' ether sent<br /> to account: ' + tgt + '<br />from Loan: ' + loan);

 	  		//$('#intro .send-brw .result').html('Loan ' + loan + ' sent ' + balance + ' to ' + tgt);
 	  	}
 	  	else {
 	  		$('#intro .send-brw .result').html('Something went wrong');
 	  	}
 	  });
  });

  //26.03
  //fund contracts
  //it turns out that this wasnt working because of i had .button instead of button
  //stupid
  
/*  $('#intro .fund button').click(function() {
  	var amt = web3.toWei($('#intro .fund .amt').val());
  	var tgt = $('#intro .fund .tgt').val();
		web3.eth.sendTransaction({to: tgt, value: amt}, function(err, result) {
			alert('is it working?');
		});
  });*/


  //.loandb
	//show LoanDB address
	$('#intro .loandb .addr .result').html(dbAddr);


	$('#intro .loandb .len button').click(function() {
		LoanDB.getLen({from:curAcct}).then(function(len) {
			$('#intro .loandb .len .result').html('Length: ' + len);
		});
	});

	//marked for deletion 26.03
	$('#intro .loandb .ls_ button').click(function() {
		LoanDB.getLen({from:curAcct}).then(function(len) {
			$('#intro .loandb .ls .result').html('');
			if (len == 0) {
				$('#intro .loandb .ls .result').html('No Loans found');
			}
			else {
				for (var i = 0; i < len; i++) {
					(function (i) {
						LoanDB.getLoan(i, {from:curAcct}).then(function(addr) {
							$('#intro .loandb .ls .result').append('<br>' + i + ': ' + addr);
							//23.03 i am running into issues because of how promises work
//							loans[i] = addr;
//							$('#intro .loandb .ls .result').append('<br>' + loans[i]);
/*							curLoan= new EmbarkJS.Contract({
  	   			    abi: Loan.abi,
  	  			    address: addr
  						});
  						curLoan.getAmt().then(function(amt) {
  							$('#intro .loandb .ls .result').append(' (' + amt +') ');
  						});*/
						});
					})(i);
				}
			}
		});
	});

	//05.04
	$('#intro .loandb .ls button.available').click(function() {
		$('#intro .loandb .ls .result').html('No available loans found');

		//first get the array length
		LoanDB.getLen({from:curAcct}).then(function(len) {
			if (len == 0 ) {
				$('#intro .loandb .ls .result').html('No loans in database');
			}
			else {
				$('#intro .loandb .ls .result').html('');
				for (var i = 0; i < len; i++) {
					(function (i) {
						LoanDB.getLoan(i, {from:curAcct}).then(function(addr) {
							//$('#intro .loandb .ls .result').append('<br>' + i + ': ' + addr);
							curLoan = new EmbarkJS.Contract({
								abi: Loan.abi,
								address: addr
							});

/*							curLoan.amt().then(function(amt) {
								amt = web3.fromWei(amt, 'ether');
								curLoan.rpy().then(function(rpy) {
								  $('#intro .loandb .ls .result').append('<br> '+ i + ': ' + addr + ': ' + amt + ', ' + rpy);
								});
							});*/

							curLoan.taken().then(function(tkn){
								if (!tkn) {
									Promise.all([
										curLoan.amt().then(function(amt) {return web3.fromWei(amt, 'ether')}),
									  curLoan.rpy().then(function(rpy) {return web3.fromWei(rpy, 'ether')})
										]).then(function(values) {
											$('#intro .loandb .ls .result').append('' + i + ': ' + addr + ': ' +
												' amt: ' + values[0] + ' rpy: ' + values[1]);
										});



/*									curLoan.rpy().then(function(rpy) {
										rpy = web3.fromWei(rpy,'ether');
								    var amt = web3.fromWei(web3.eth.getBalance(addr), 'ether');
  							    $('#intro .loandb .ls .result').append('<br> ' +  i + ': ' + addr + ': ' +
								    amt + ', ' + rpy);
							    });*/
								}
							});
						});
					})(i);
				}
			}
		});
	});

	//05.04
	//ls all loans
	//08.04 adapted to include repayment status
  $('#intro .loandb .ls button.all').click(function() {
		//first get the array length
		LoanDB.getLen({from:curAcct}).then(function(len) {
			$('#intro .loandb .ls .result').html('');
			if (len == 0 ) {
				$('#intro .loandb .ls .result').html('No loans in database');
			}
			else {
				for (var i = 0; i < len; i++) {
					(function (i) {
						LoanDB.getLoan(i, {from:curAcct}).then(function(addr) {
							//$('#intro .loandb .ls .result').append('<br>' + i + ': ' + addr);
							curLoan = new EmbarkJS.Contract({
								abi: Loan.abi,
								address: addr
							});

/*							curLoan.amt().then(function(amt) {
								amt = web3.fromWei(amt, 'ether');
								curLoan.rpy().then(function(rpy) {
								  $('#intro .loandb .ls .result').append('<br> '+ i + ': ' + addr + ': ' + amt + ', ' + rpy);
								});
							});*/

							Promise.all([
								curLoan.amt().then(function(amt) {return web3.fromWei(amt, 'ether')}),
								curLoan.rpy().then(function(rpy) {return web3.fromWei(rpy, 'ether')}),
								curLoan.taken().then(function(tkn) {
									if (tkn) return "Taken";
									else return "Available";
								  }),
								curLoan.repaid().then(function(repaid) {
									if (repaid) return "Repaid";
									else return "Awaiting repayment";
								}),
								curLoan.request().then(function(request) {
									if (request) return "Request";
									else return "Offer";
								})
								]).then(function(values) {
									var bal = web3.fromWei(web3.eth.getBalance(addr), 'ether');
									$('#intro .loandb .ls .result').append('' + i + ': ' + addr + ': ' +
										' amt: ' + values[0] + ' rpy: ' + values[1] + ' bal: ' + bal +
										' ' + values[2] + ' ' + values[3] + ' ' + values[4] + ' <br />')
								});

/*							curLoan.rpy().then(function(rpy) {
								rpy = web3.fromWei(rpy,'ether');
						    var amt = web3.fromWei(web3.eth.getBalance(addr), 'ether');
						    $('#intro .loandb .ls .result').append('<br> ' +  i + ': ' + addr + ': ' +
						    amt + ', ' + rpy);
					    });*/
						});
					})(i);
				}
			}
		});
	});

	//05.04
	//ls promise test
  $('#intro .loandb .ls button.test').click(function() {
		//first get the array length
		LoanDB.getLen({from:curAcct}).then(function(len) {
			$('#intro .loandb .ls .result').html('');
			if (len == 0 ) {
				$('#intro .loandb .ls .result').html('No loans in database');
			}
			else {
				for (var i = 0; i < len; i++) {
					(function (i) {
						LoanDB.getLoan(i, {from:curAcct}).then(function(addr) {
							//$('#intro .loandb .ls .result').append('<br>' + i + ': ' + addr);
							curLoan = new EmbarkJS.Contract({
								abi: Loan.abi,
								address: addr
							});

							Promise.all([
								  curLoan.amt().then(function(amt) {return web3.fromWei(amt,'ether')}),
								  curLoan.rpy().then(function(rpy) {return web3.fromWei(rpy,'ether')}),
								  curLoan.taken().then(function(tkn) {
								  	if (tkn) return "Taken";
								  	else return "Available";
								  })
								]).then(function(values) {
									var bal = web3.fromWei(web3.eth.getBalance(addr),'ether');
									$('#intro .loandb .ls .result').append('' + i + ':  amt: ' + values[0] +
										'  rpy: ' + values[1] + '  ' + values[2] +'  bal: ' + bal + '<br />');
								});

/*							curLoan.amt().then(function(amt) {
								amt = web3.fromWei(amt, 'ether');
								curLoan.rpy().then(function(rpy) {
								  $('#intro .loandb .ls .result').append('<br> '+ i + ': ' + addr + ': ' + amt + ', ' + rpy);
								});
							});*/

/*							curLoan.rpy().then(function(rpy) {
						    var amt = web3.fromWei(web3.eth.getBalance(addr), 'ether');
						    $('#intro .loandb .ls .result').append('<br> ' +  i + ': ' + addr + ': ' +
						    amt + ', ' + rpy);
					    });*/
						});
					})(i);
				}
			}
		});
	});	

  //10.04 new ls request handler
	$('#intro .loandb .ls button.rq').click(function() {
		//first get the array length
		LoanDB.getLen({from:curAcct}).then(function(len) {
			$('#intro .loandb .ls .result').html('');
			if (len == 0 ) {
				$('#intro .loandb .ls .result').html('No loans in database');
			}
			else {
				for (var i = 0; i < len; i++) {
					(function (i) {
						LoanDB.getLoan(i, {from:curAcct}).then(function(addr) {
							curLoan = new EmbarkJS.Contract({
								abi: Loan.abi,
								address: addr
							});
							Promise.all([
								curLoan.amt().then(function(amt) {return web3.fromWei(amt, 'ether')}),
								curLoan.rpy().then(function(rpy) {return web3.fromWei(rpy, 'ether')}),
								curLoan.repaid().then(function(repaid) {
									if (repaid) return "Repaid";
									else return "Awaiting repayment";
								}),
								curLoan.request().then(function(request) { return request; })
								]).then(function(values) {
									if (values[3]) {
										var bal = web3.fromWei(web3.eth.getBalance(addr), 'ether');
										$('#intro .loandb .ls .result').append('' + i + ': ' + addr + ': ' +
											' amt: ' + values[0] + ' rpy: ' + values[1] + ' bal: ' + bal +
											' ' + values[2] + '<br />');
									}
								});
						});
					})(i);
				}
			}
		});
	});

	//05.04
	//take loan - add borrower addr to loan | set taken to true | transfer ether to borrower
	$('#intro .loandb .take-ln button').click(function() {
		var index = $('#intro .loandb .take-ln input').val();
		//alert(index);
		LoanDB.getLoan(index , {from: curAcct}).then(function(addr) {
			curLoan = new EmbarkJS.Contract({
				abi: Loan.abi,
				address: addr
			});

			curLoan.taken().then(function(tkn) {
				if(!tkn) {
					Promise.all([
						curLoan.setBorrower({from: curAcct}).then(function(brw) {
							return "success";
						}),
						curLoan.amt().then(function(amt) {
							return web3.fromWei(amt,'ether');
						}),
						curLoan.rpy().then(function(rpy) {
							return web3.fromWei(rpy, 'ether');
						})]).then(function(values) {
							$('#intro .loandb .take-ln .result').html('' + values[0] + '!<br />' +
								'Loan: ' + addr +
								'<br />amount: ' + values[1] + ' <br />repayable: ' + values[2] +
								'<br />taken by: ' + curAcct);
						});
/*					curLoan.setBorrower({from: curAcct}).then(function(brw) {
						curLoan.amt().then(function(amt) {
							amt = web3.fromWei(amt, 'ether');
							curLoan.rpy().then(function(rpy) {
								//rpy = web3.fromWei(rpy, 'ether');
							  $('#intro .loandb .take-ln .result').html('Loan: ' + addr +
						    '<br />amt: ' + amt +
						    '<br />rpy: ' + rpy +
							  '<br />borrower: ' + curAcct);
							});
						});
					});*/
				}
				else {
					$('#intro .loandb .take-ln .result').html('Loan at index <code>'+ index +'</code> already taken');
				}
			});
		});
	});

	//06.04
/*	$('#intro .loandb .test button').click(function() {
		//$('#intro .loandb .test .result').html('hellooo');
		var addr = $('#intro .loandb .test input').val();
		curLoan = new EmbarkJS.Contract({
			abi: Loan.abi,
			address: addr
		});

		curLoan.rpy().then(function(rpy) {
			var rpy = web3.fromWei(rpy,'ether');
			alert(rpy);
			$('#intro .loandb .test .result').html('' + rpy);
		});		
		//$('#intro .loandb .test .result').html(' yo');
	});*/

	//06.04
  $('#intro .loandb .rpy-ln button').click(function() {
  	var index = parseInt($('#intro .loandb .rpy-ln input').val());

  	//first get the loan
  	LoanDB.getLoan(index, {from: curAcct}).then(function(addr) {
  		curLoan = new EmbarkJS.Contract({
  			abi: Loan.abi,
  			address:  addr
  		});

	  	Promise.all([
				curLoan.rpy().then(function(rpy) {return parseFloat(web3.fromWei(rpy,'ether'));}),
				curLoan.borrower().then(function(brw) {return brw;}),
				curLoan.amt().then(function(amt) {return amt;}),
				curLoan.repaid().then(function(repaid) {return repaid;})
				]).then(function(values) {
					if (curAcct != values[1]) {
						alert('you are not the borrower for this loan');
						$('#intro .loandb .rpy-ln .result').html('Error: you aren\'t the borrower for this loan');
					}
					else if(values[3]) {
						alert('Error: loan has already been repaid');
					}
					else if (values[0] > parseFloat(web3.fromWei(web3.eth.getBalance(curAcct),'ether'))) {
						alert('Error: you don\'t have enough ether');
					}
					else {
						curLoan.repay({from: curAcct, value: web3.toWei(values[0],'ether')}).then(function() {
							alert ('repaid loan: ' + values[0] + ' ether');
							$('#intro .loandb .rpy-ln .result').html('successfully repaid loan' +
								'<br />' + values[0] + ' ether sent' +
								'<br />from: ' + curAcct +
								'<br />loan: ' + addr);
						});
					}
				});
  	});


		//$('#intro .loandb .rpy-ln .result').html('hello');
/*		Promise.all([
			curLoan.rpy().then(function(rpy) {return rpy})]).then(function(values) {
				$('#intro .loandb .rpy-ln .result').html("HELLO");
			});*/


/*		(curLoan.rpy().then(function(rpy) {
			alert(rpy);
			web3.eth.sendTransaction({to: addr, from: curAcct, })
		});  	*/
  });

	//05.04
	$('#intro .loandb .get-br button').click(function() {
		var index = $('#intro .loandb .get-br input').val();
		LoanDB.getLoan(index , {from: curAcct}).then(function(addr) {
			curLoan = new EmbarkJS.Contract({
				abi: Loan.abi,
				address: addr
			});
			curLoan.borrower().then(function(br) {
				var brAddr = br.toString();
				alert(brAddr);
			});
		});
	});



  //05.04
	$('#intro .loandb .get-taken button').click(function() {
		var index = $('#intro .loandb .get-taken input').val();
		//alert(index);
		LoanDB.getLoan(index , {from: curAcct}).then(function(addr) {
			curLoan = new EmbarkJS.Contract({
				abi: Loan.abi,
				address: addr
			});
			curLoan.taken().then(function(result) {
				if (result) {
					alert("loan unavailable - already taken");
				  $('#intro .loandb .get-taken .result').html("Loan: " + addr + "<br />" +
					  "borrower: " + curAcct);
				}
				else {
					//alert("this loan is available");
					$('#intro .loandb .get-taken .result').html("loan is available");
				}
			});
		});
	});

	//23.03
	//a new handler to just display the balance of a loan at a give address
	//so i can successfully retrieve the loan in this way
	//but the balance appears to be 0


  //24.03
  //loan balance is better termed loan amount
  //modified to test automagically created public field getter
  //public uint amt amt()
  //basic getter =
  //take address -> set new EmbarkJS.Contract({ abi, addr }) -> newContract.myMethod().then(etc)
  //change to retrieve actual balance of a given address
  //could be account or contract
  //26.03
  //funding functionality added in .add
  //check balance with this
	$('#intro .loandb .lnbal button').click(function() {
		//take the input address
		//set the curLoan
		var addr = $('#intro .loandb .lnbal input').val();

		var bal = web3.fromWei(web3.eth.getBalance(addr),'ether');

		$('#intro .loandb .lnbal .result').html('' + bal);

		//pre 24.03 modification
/*		curLoan = new EmbarkJS.Contract({
			abi: Loan.abi,
			address: addr
		});

		curLoan.amt().then(function(amt) {
			$('#intro .loandb .lnbal .result').html('' + amt);
		});*/

/*		curLoan.getAmt().then(function(amt) {
			$('#intro .loandb .lnbal .result').html(''+ amt);
		});*/
	});

	//23.02
	//loans need to be deployed in parallel i.e. added to LoanDB address array
	//and actually deployed on the blockchain separately
	//24.03
	//updated handler to take more params
	//26.04
	//Loan contracts need to be funded from the creator account
	//web3.eth.sendTransaction({txObj})
	//06.04 having difficulties with
	//adding amount and repay values of loans
	$('#intro .loandb .add button').click(function() {
		//var amt = web3.toWei($('#intro .loandb .add input.amt').val());
		//amt = web3.toWei(amt, 'ether');
		//var rpy = web3.toWei($('#intro .loandb .add input.rpy').val());

		var amt = $('#intro .loandb .add input.amt').val();
		var rpy = $('#intro .loandb .add input.rpy').val();

		var amtWei = web3.toWei(amt, 'ether');
		var rpyWei = web3.toWei(rpy, 'ether');

		//26.03
		//added Loan.deploy([args],{txOptions})
		Loan.deploy([amtWei, rpyWei, false], {from: curAcct, value: amtWei}).then(function(deployedLoan) {
			curLoan = deployedLoan; //marked for deletion

			$('#intro .loandb .add .result').html('Loan deployed: ' + deployedLoan.address + ' (' + amt +
				', ' + rpy +')');


			/*deployedLoan.initLoan(amt, rpy, {from: curAcct}).then(function(success) {
				if(success) {
					$('#intro .loandb .add .result').append('<br>Loan deployed: ' + deployedLoan.address + '(' + amt +
				  ', ' + rpy +')');
				}
				else $('#intro .loandb .add .result').append('Error: loan amt and rpy not initialised');
			});
*/
			ldb.addLoan(deployedLoan.address, {from: curAcct}).then(function() {
				$('#intro .loandb .add .result').append('<br />Added to LoanDB');

				web3.eth.sendTransaction({from: curAcct, to: deployedLoan.address, value: amtWei});
			});
		});
	});

	//10.04 - loan requests
	$('#intro .loandb .rq button').click(function() {
		var amt = $('#intro .loandb .rq input.amt').val();
		var rpy = $('#intro .loandb .rq input.rpy').val();

		var amtWei = web3.toWei(amt, 'ether');
		var rpyWei = web3.toWei(rpy, 'ether');

		Loan.deploy([amtWei, rpyWei, true], {from: curAcct, value: amtWei}).then(function(deployedLoan) {
			curLoan = deployedLoan; //marked for deletion

			$('#intro .loandb .rq .result').html('Loan request deployed: ' + deployedLoan.address + '(' + amt +
				', ' + rpy + ')');

			ldb.addLoan(deployedLoan.address, {from: curAcct}).then(function() {
				$('#intro .loandb .rq .result').append('<br />Added to LoanDB');
			});
		});
	});

	//10.04 - fill loan request
	$('#intro .loandb .fill-rq button').click(function() {
		var index = $('#intro .loandb .fill-rq input').val();

		ldb.getLoan(index, {from:curAcct}).then(function(addr) {
			curLoan = new EmbarkJS.Contract({
				abi: Loan.abi,
				address: addr
			});
			Promise.all([
				curLoan.amt({from:curAcct}).then(function(amt) { return amt }),
				curLoan.borrower({from:curAcct}).then(function(brw) { return brw})
				]).then(function(values) {
					curLoan.fillRequest({from:curAcct, value:values[0]}).then(function(success) {
						var bal = web3.fromWei(values[0],'ether');
						$('#intro .loandb .fill-rq .result').html('Filled loan request: ' + addr +
							'<br />Loaned ' + bal + ' ether' + '<br />To ' + values[1]);
					});
				});
		});
	});

	//10.04 get owner of loan
	$('#intro .loandb .get-owner button').click(function() {
		var addr = $('#intro .loandb .get-owner input').val();

		curLoan = new EmbarkJS.Contract({
			abi: Loan.abi,
			address: addr
		});

		curLoan.owner().then(function(owner) {
			$('#intro .loandb .get-owner .result').html('owner ' + owner);
		});
	});

	//24.03
	//modify rm
	//needs to remove Loan from the blockchain i.e. kill
	//initial implementation
	//error - rmLoan doesn't return an address
	//restructured to wrap rmLoan within kill
	//fortunately the two are independent
	$('#intro .loandb .rm button').click(function() {
		var index = $('#intro .loandb .rm input').val();

		ldb.getLen({from:curAcct}).then(function(len) {
			var len = parseInt(len);
			if (index < 0 || index > len) {
				alert('Loan not found at index');
			}
			else {
				ldb.getLoan(index, {from:curAcct}).then(function(addr) {
					curLoan = new EmbarkJS.Contract({
						abi: Loan.abi,
						address: addr
					});
					curLoan.kill({from:curAcct}).then(function() {
						var rmAddr = addr.toString();
						ldb.rmLoan(index, {from:curAcct}).then(function() {
							$('#intro .loandb .rm .result').html('removed loan: ' + rmAddr);
						}).catch('LoanDB.rmLoan promise rejection');
					}).catch(function() {
						console.log('curLoan.kill promise rejection. Could not remove loan');
					});
				});
			}
		});



/*		LoanDB.rmLoan(index).then(function(addr) {
			curLoan = new EmbarkJS.Contract({
				abi: Loan.abi,
				address: addr
			});
			curLoan.kill().then(function() {
				var rmAddr = addr.toString();
				$('#intro .loandb .rm .result').html('removed loan: ' + rmAddr);
			});
			//var address = addr.toString();
			//$('#intro .loandb .rm .result').html('removed loan: ' + addr);
		});*/
	});

	//23.03 better termed as set current loan
	//06.04 altered to actually inspect the values i.e.
	//return amt rpy and taken
	$('#intro .loandb .inspect button').click(function() {
		var index = $('#intro .loandb .inspect input').val();
		LoanDB.getLoan(index, {from: curAcct}).then(function(addr) {
			curLoanIndex = index;
			curLoan= new EmbarkJS.Contract({
  	    abi: Loan.abi,
  	    address: addr
  		});
			curLoan.rpy().then(function(rpy) {
				alert(rpy);
				$('#intro .loandb .inspect .result').html(rpy);
			});
		});
	});

	//23.03
	//spoke to phil watten re: structure of report
	//showed basic basic prototype
	//function returns the address of the current loan set in the handler above
	$('#intro .loandb .cur button').click(function() {
		var addr = curLoan.address;
		$('#intro .loandb .cur .result').html(addr);
	});

  //handlers for the modded loandb
  $('#sand .dbmod .mk button').click(function() {
  	LoanDB.mkLns({from:curAcct}).then(function() {
  		$('#sand .dbmod .mk result').html('added loans');
  	});
  });

  $('#sand .dbmod .get-amt button').click(function() {
  	var index = ('#sand .dbmod .get-amt input').val();
  	ldb.getLnAmt(index, {from:curAcct}).then(function(amt) {
  		$('#sand .dbmod .get-amt .result').html(amt);
  	});
  });

});