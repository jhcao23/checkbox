var $j = jQuery.noConflict();

function getTrimmedLowerCase(aString){
	return aString.trim().toLowerCase();
}
function findTr(checkboxInput){
	return checkboxInput.closest("tr");
}
function findCheckboxNotAppilcable(checkboxInput){
	var allCheckboxes = checkboxInput.closest("table").find("input:checkbox");
	console.log("allCheckboxes is %o", allCheckboxes);
	for(c=0;c<allCheckboxes.length;c++){
		console.log("current checkbox is %s", allCheckboxes[c].id);
		var curCheckbox = findInputById(allCheckboxes[c].id);
		var curLabel = curCheckbox.next();
		console.log("curLabel is %o", curLabel);
		var curLabelTxt = curLabel.text();
		console.log("curLabelTxt is %s", curLabelTxt);
		if( getTrimmedLowerCase(curLabelTxt).substring(0,14)=='not applicable') {
			console.log("find the Not Applicable checkbox, return it: %o", curCheckbox);
			return curCheckbox;
		}
	}
	return null;
}
function findParentCheckbox (childBox) {
	console.log("findParentCheckbox starts");
	var childTr = findTr(childBox);
	console.log("tr.id="+childTr.attr('id'));
	var prevTr = childTr.prev();
	for(i=1;prevTr && prevTr.length>0;i++){				
		console.log("prevTr.id="+prevTr.attr('id'));
		var prevLabel=prevTr.find("label");
		console.log("label for:"+prevLabel.attr('for'));
		var prevTxt = getTrimmedLowerCase(prevLabel.text());
		console.log('prevTxt='+prevTxt);
		var prevInput = prevTr.find("input:checkbox");
		console.log("prevInput.id="+prevInput.attr('id'));
		if(prevTxt.charAt(0)=='-'){
			console.log('previous child is '+prevTxt);
		}else{
			console.log('find parent is '+prevTxt);
			return prevInput;
		}
		prevTr = prevTr.prev();
		console.log("prevTr is %o", prevTr);
	}
	return null;
}

function findChildrenCheckbox(parentBox){
	console.log("findChildrenCheckbox starts");
	var childrenBox = [];
	var myTr = findTr(parentBox);
	var nextTr = myTr.next();
	console.log("nextTr=%0", nextTr);
	for(i=1;nextTr && nextTr.length>0;i++){
		console.log("nextTr.id="+nextTr.attr("id"));
		var nextLabel=nextTr.find("label");
		console.log("label for:"+nextLabel.attr('for'));
		var nextTxt = getTrimmedLowerCase(nextLabel.text());
		console.log("nextTxt="+nextTxt);
		var nextInput = nextTr.find("input:checkbox");
		console.log("nextInput.id="+nextInput.attr("id"));
		if(nextTxt.charAt(0)=='-'){
			console.log("next child is "+nextTxt);
			childrenBox.push(nextInput);			
		}else{
			console.log("next parent is "+nextTxt);
			return childrenBox;
		}
		nextTr = nextTr.next();
		console.log("nextTr is %0", nextTr);
	}	
	return childrenBox;
}

function findAnyoneChecked(childrenBox){
	for(i=0;i<childrenBox.length;i++){
		if(childrenBox[i].attr("checked")==true){
			return true;
		}
	}
	return false;
}

function check8(checkboxInput){
	if(checkboxInput){
		checkboxInput.attr('checked', true);
	}
}
function uncheck8(checkboxInput){
	if(checkboxInput){
		checkboxInput.attr('checked', false);
	}
}
function uncheckAllInputCheckboxWithinTable(checkboxInput){
	console.log("uncheckAllInputCheckboxWithinTable of %s", checkboxInput.attr('id'));
	uncheck8(checkboxInput.closest("table").find("input:checkbox"));
}

function findInputById(eid){
	var id = eid;
	var e = $j("input[id='"+id+"']");
	return e;
}
function checkboxChange(eid, otherId){
	console.log("starting checkboxChange(%s, %s)", eid, otherId);
	var e = findInputById(eid);
	var boxChecked = e.attr('checked');
	console.log( "boxChecked="+boxChecked	);
	var txt = getTrimmedLowerCase(e.next().text());
	console.log("txt::%s",txt);
	if (txt.charAt(0)=="-") {
		//it is a child
		console.log(txt+" start with - ==> it is a child");
		var txtAfterDash = getTrimmedLowerCase(txt.substring(1));
		if(txtAfterDash.substring(0,5)=='other'){
			//the corresponding text input should be required if checked 'other' or '- other'
			if(otherId){
				var otherInputText = findInputById(otherId);
				console.log("find otherInputText::%o", otherInputText);
				if(otherInputText){
					if(boxChecked==true){
						otherInputText.attr('required','required');
					}else{
						otherInputText.removeAttr("required");
					}
				}
			}
		}
		var p = findParentCheckbox(e);
		if(boxChecked==true){//if checked
			console.log("child box checked");
			//go up to find parent, 
			//if parent unchecked -> check parent
			if(p.attr('checked')==true){
				console.log("parent checkbox is checked");
			}else{
				console.log("parent checkbox is unchecked");
				check8(p);
			}
			//uncheck Not Applicable if found
			uncheck8(findCheckboxNotAppilcable(e));
		}else{//if unchecked
			console.log("child box de-checked");
			//go up to find parent
			//if parent is checked
			if(p.attr('checked')==true){
			//find any child checked -> if none, uncheck parent
				var childrenOfParent = findChildrenCheckbox(p);
				if(findAnyoneChecked(childrenOfParent)==false){
					uncheck8(p);
				}
			}
		}
				
	} else {		
		//it is a parent
		console.log(txt+" not start with - ==> it is a parent");
		if(txt.substring(0,14)=='not applicable'){
			console.log("special::not applicable");
			if(boxChecked==true){
				//uncheck everything else
				uncheckAllInputCheckboxWithinTable(e);
				//only keep self checked
				check8(e);
			}else{
				console.log("not applicable is unselected, now other options are free to select.");
			}
		}else if(txt.substring(0,5)=='other'){
			console.log("special::other");
			console.log("special::other:checked");
			//the corresponding text input should be required if checked 'other' or '- other'
			if(otherId){
				var otherInputText = findInputById(otherId);
				console.log("find otherInputText::%o", otherInputText);
				if(otherInputText){
					if(boxChecked==true){
						otherInputText.attr('required','required');
					}else{
						otherInputText.removeAttr("required");
					}
				}
			}			
		}else{
			var children = findChildrenCheckbox(e);
			if(boxChecked==true){
				//if checked
				console.log("box checked");
				//check all children
				children.forEach(check8);
				//uncheck Not Applicable if found
				uncheck8(findCheckboxNotAppilcable(e));
			}else{
				//if de-checked
				console.log("box unchecked");
				//uncheck all children
				children.forEach(uncheck8);
			}
		}
	}
	return false;
}


