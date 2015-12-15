/**
 * Paletton base color: #183747
 */

var url = "http://app.knomos.ca/api/cases/bcca/2013/173/citations";
var index = 0;

// The data we parse from the JSON responses.
// ie. the list of citations per each case
var caseArray = [];

// The cases, ie. the case in caseIndice[x] has its citations in 
// caseArray[x]
var caseIndices = [];

// This will store the names that will be displayed on the viz.
var namesArray = [];

// This is the actual dependency matrix pushed to d3.
// Not used anymore.
var referenceMatrix = [];

// We are using this now:
var citedByArray = [];

var chart;

var theUsername = "kenmansfield";
var thePassword = "l1IJD9bzklvKHXto0lojGk78ujdzE7J7";

var parentHtml;

var caseNumber;
var caseYear;

function dataSubmitted()
{
	parentHtml = window.parent.document.getElementById('content').contentWindow.document;
	caseArray = [];
	caseIndices = [];
	namesArray = [];
	referenceMatrix = [];
	citedByArray = [];
	index = 0;
	
	// Start with our very first. 
	// Replace this in the future with whatever our input is.
	//d3.select('#chart_placeholder svg').remove();
	var form = parentHtml.getElementById('iframe2').contentWindow.document.getElementById('inputForm');
	
	caseNumber = form.theCaseNum.value;
	caseYear =  form.theCaseYear.value;
	
	url = "http://app.knomos.ca/api/cases/bcca/" + caseYear + 
	"/" + caseNumber + "/citations";
	
	var caseName = caseYear + "-" + caseNumber;
	caseIndices.push(caseName);
	namesArray.push(caseName);
	
	newRequest();
}

function statusFinishedLoading(data)
{
	parentHtml.getElementById('iframe2').contentWindow.document.getElementById("errorMessage").innerHTML = "Loaded";
	parentHtml.getElementById('iframe1').contentWindow.angular.element("body").scope().updateData(data);
}
 
function statusLoading(loadedIndex)
{
	var loadingText = "Loading: " + loadedIndex;
	if(caseArray[0] && caseArray[0].length > 0)
	{
		loadingText = loadingText + " of " + caseArray[0].length;
	}
	parentHtml.getElementById('iframe2').contentWindow.document.getElementById("errorMessage").innerHTML = loadingText;	
}

function newRequest()
{
	var xmlhttp = new XMLHttpRequest();
	var form = parentHtml.getElementById('iframe2').contentWindow.document.getElementById('authForm');
	theUsername = form.username.value;
	thePassword =  form.password.value;

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			statusLoading(index);
			referenceLoad(xmlhttp.responseText);
		}
		else
		{
			//handle error.
			if(xmlhttp.status == 401 || xmlhttp.status == 404)
			{
				parentHtml.getElementById('iframe2').contentWindow.document.getElementById("errorMessage").innerHTML = xmlhttp.responseText;
			}
		}
	}
	xmlhttp.open("GET", url, true);
	
	xmlhttp.setRequestHeader ("Authorization", "Basic " + btoa(theUsername + ":" + thePassword));	
	xmlhttp.send();
}

function referenceLoad(response)
{
	//deprecated
	//caseArray.push(parseFunction(response, index));

	caseArray.push(parseObject(response, index));
	//okay, that response is hopefully parsed.
	//parse everything that it has loaded.
	
	var arrayLength = caseArray[0].length;
	
	if( arrayLength <= index)
	{
		//Now we've built an array with all the 1st and 2nd degree citations.
		//Next we need to build our dependency matrix.
		//First, we need the labels for each.
		//need to go through entire array to get unique id's.
		
		//deprecated.
		//createUniqueNameList();
		
		//now build our matrix!
		//referenceMatrix = buildMatrix();
		
		//With our matrix, and our name list we can now create our d3 wheel!!!!
		//doD3();
		
		//Doing this differently now. Just gonna do pairings.
		LoadD3Data();
		return;
	}
	

	var caseToQuery = caseArray[0][index].cites;
	if(caseToQuery.year == caseYear && caseToQuery.case_num == caseNumber)
	{
		caseToQuery = caseArray[0][index].cited_by;
	}

	//deprecated
	//caseIndices.push(caseArray[0][index].case_year + "-" + caseArray[0][index].case_num);
	//url = "http://app.knomos.ca/api/cases/bcca/" + caseArray[0][index].case_year + "/" + caseArray[0][index].case_num + "/citations";
	
	url = "http://app.knomos.ca/api/cases/bcca/" + caseToQuery.year + "/" + caseToQuery.case_num + "/citations";
	
	index++;
	newRequest();
}

//This function stores all of the citations for that case into the
//array at the index.
/*//deprecated. this was what originally used for the BuildMatrix function.
function parseFunction(response) 
{
    var obj = JSON.parse(response);
	var newCaseArray = [];
	
	//Cites
	obj.general_case.outgoing.forEach(function(ref) 
	{
		console.log(ref.target_case.citation);
		var caseObj = new Object();
		caseObj.case_num = ref.target_case.case_num;
		caseObj.case_year = ref.target_case.year;
		caseObj.cited_by = false;
		caseObj.soc1 = ref.target_case.soc;
		caseObj.soc2 = ref.source_case.soc;
		
		if(caseObj.case_num && caseObj.case_year)
		{
			newCaseArray.push(caseObj);
		}
	});

	//Cited By.
	obj.general_case.incoming.forEach(function(ref) 
	{
		var caseObj = new Object();
		console.log(ref.source_case.citation);
		
		caseObj.case_num = ref.source_case.case_num;
		caseObj.cited_by = true;
		caseObj.case_year = ref.source_case.year;
		caseObj.soc = ref.source_case.soc;
		
		caseObj.soc2 = ref.target_case.soc;
		
		if(caseObj.case_num && caseObj.case_year)
		{
			newCaseArray.push(caseObj);
		}
	});
	return newCaseArray;
}*/

//Creates new objects that contain a pair of cites and cited by cases with all necessary data.
function parseObject(response) 
{
    var obj = JSON.parse(response);
	var newCaseArray = [];
	
	//Cites
	obj.general_case.outgoing.forEach(function(ref) 
	{
		console.log(ref.target_case.citation);
		var caseObj = new Object();
		caseObj.cites = ref.target_case;
		
		//This case.
		caseObj.cited_by = ref.source_case;
		
		if(caseObj.cites.case_num && caseObj.cites.year)
		{
			newCaseArray.push(caseObj);
		}
	});

	//Cited By.
	obj.general_case.incoming.forEach(function(ref) 
	{
		var caseObj = new Object();
		console.log(ref.source_case.citation);
		
		//This case.
		caseObj.cites = ref.target_case;

		caseObj.cited_by = ref.source_case;
		
		
		if(caseObj.cited_by.case_num && caseObj.cited_by.year)
		{
			newCaseArray.push(caseObj);
		}
	});
	return newCaseArray;
}

function createUniqueNameList()
{
	var thelength = caseArray.length;
	for(i = 0; i < thelength; i++)
	{
		for(j = 0; j < caseArray[i].length; j++)
		{
			//probably need to change this to something more informative. 
			var name = caseArray[i][j].year + "-" + caseArray[i][j].case_num;
			if(namesArray.indexOf(name) == -1)
			{
				namesArray.push(name);
			}
		}
	}
}



//Deprecated
/*
function buildMatrix()
{
	
	//Todo: How to differentiate between cites and citedby
	//make it twice as wide for cited?
	
	//Todo: add 3rd degree alters? or just add the inter-references for 2nd degree alters?
	//(either way it would need to make a 2nd round of queries, so loading would take longer)
	
	var retArray = [];
	for(i = 0; i < namesArray.length; i++)
	{
		retArray[i] = [];
		for(j = 0; j < namesArray.length; j++)
		{	
			retArray[i][j] = 0;
		}
	}
	
	//X-ref'ing the data we have in our names array - our 1st level citations.
	for(i = 0; i < namesArray.length; i++)
	{
		for(j = 0; j < namesArray.length; j++)
		{	
			var caseArrayIndice = caseIndices.indexOf(namesArray[i]);
			
			if( caseArrayIndice >= 0 )
			{
				//This goes through that cases entire list of citations (including 2nd degree citations.
				for(z = 0; z < caseArray[caseArrayIndice].length; z++)
				{
					var tempString = caseArray[caseArrayIndice][z].case_year + "-" + caseArray[caseArrayIndice][z].case_num;
					if(tempString == namesArray[j])
					{
						
						retArray[i][j] = 2;
						
						//receiving side, need to set it to something otherwise it is really skinny.
						if(retArray[j][i] == 0)
						{
							retArray[j][i] = 1;
						}
					}
				}
			}
		}
	}
	return retArray;
}
*/

function doD3()
{
	d3.select("svg").remove();
	var data = {
		packageNames: namesArray,
		matrix: referenceMatrix
	  };
	 
	chart = d3.chart.dependencyWheel().width(600)    // also used for height, since the wheel is in a a square 
	.margin(120)   // used to display package names 
	.padding(.01) // separating groups in the wheel 

	d3.select("body").transition();
	d3.select('#chart_placeholder svg').remove(); 
	d3.select("svg").remove();	
	d3.select('#chart_placeholder').datum(data).call(chart);
	d3.select('#chart_placeholder').transition();

}


//Simple array that contains cites/cited by
function LoadD3Data()
{
	//Need to flatten and reduce our 2D caseArray. 
	//Reduce as in remove dupes, since case X cites case Y, then we query and parse case Y, which again has a cited by
	//reference to case X.
	var flatArray = [];
	// We add + 1 because caseArray[0] contains its own citations in the first index
	for(i = 0; i < caseArray[0].length + 1; i++)
	{
		var tempArray = caseArray[i];
		for(j = 0; j < tempArray.length; j++)
		{
			flatArray.push(tempArray[j])
		
		}
	}
	//create an array without dupes
	var uniqueArray = [];
	for(x = 0; x < flatArray.length; x++)
	{
		var flatCase = flatArray[x];
		var isUnique = true;
		for(y = 0; y < uniqueArray.length; y++)
		{
			var uniqueCase = uniqueArray[y];
			if(uniqueCase.cites.year == flatCase.cites.year && uniqueCase.cites.case_num == flatCase.cites.case_num)
			{
				if(uniqueCase.cited_by.year == flatCase.cited_by.year && uniqueCase.cited_by.case_num == flatCase.cited_by.case_num)
				{
					isUnique = false;
				}
			}
		}
		if(isUnique)
		{
			uniqueArray.push(flatCase);
		}
	}
	
	//Still need to build one more array!!! the data for the chord matrix is different than our data 
	//(maybe it should be changed? too much work for now).
	//citedByArray 
	for(z = 0; z < uniqueArray.length; z++)
	{
		var theCase = uniqueArray[z];
		var obj = {};
		obj.importer1 = theCase.cited_by.year + "-" + theCase.cited_by.case_num;
		obj.importer2 = theCase.cites.year + "-" + theCase.cites.case_num; 
		obj.flow1 = 1;
		obj.flow2 = 4;
		obj.year = theCase.cites.year;
		obj.soc1 = theCase.cited_by.soc;
		obj.soc2 = theCase.cites.soc; 
		citedByArray.push(obj);
	}
	
	parentHtml.defaultView.updateTimeSlider(getPrimaryCasesArray().length);
	statusFinishedLoading(citedByArray);
}

function compare(a,b) {
	  if (a.importer1 < b.importer1)
	    return -1;
	  if (a.importer1 > b.importer1)
	    return 1;
	  return 0;
	}

function getPrimaryCasesArray()
{
	var ret = [];
	if(citedByArray)
	{
		var theArray = citedByArray.sort(compare);
		if(theArray == null) {return ret;}
	    ret.push(theArray[0]);
	    for (var i = 1; i < theArray.length; i++) { // start loop at 1 as element 0 can never be a duplicate
	        if (theArray[i-1].importer1 !== theArray[i].importer1) {
	            ret.push(theArray[i]);
	        }
	    }
	}
    return ret;
}

function getSelectedCase(index)
{
	if(isNaN(index))
	{
		index = 0;
	}
	//occcasionaly this number is coming in as a float and causing an exception.
	index = Math.round(index);
	var theArray = getPrimaryCasesArray();

	if(typeof theArray[index] !== 'undefined' && index < theArray.length)
	{
		return theArray[index].importer1;
	}
	return 0;
}

var isPlaying = false;
function playTimeLine()
{
	if(isPlaying == false)
	{
		progressTimeLine(true);
	}
	else
	{
		parentHtml.getElementById('iframe2').contentWindow.document.getElementById('playButton').innerHTML = 'Play Timeline';
		isPlaying = false;
	}
}

function progressTimeLine(start)
{
	var stepObj = {};
	if(isPlaying == false && start == true)
	{
		//Start playing!
		parentHtml.getElementById('iframe2').contentWindow.document.getElementById('playButton').innerHTML = 'Stop Timeline';
		stepObj = parentHtml.defaultView.moveTimeSlider(0);
		isPlaying = true;
	}
	else if(isPlaying == false && start == false)
	{
		//not currently playing and not starting a new time line, so don't start playing.
		return;
	}
	else
	{
		stepObj = parentHtml.defaultView.moveTimeSlider(+1);
	}
	
	if(stepObj.steps == stepObj.currentStep)
	{
		//Stop Playing.
		isPlaying = false;
		parentHtml.getElementById('iframe2').contentWindow.document.getElementById('playButton').innerHTML = 'Play Timeline';
	}
	else
	{
		setTimeout(progressTimeLine, 4000, false);
	}
}

function stopTimeLine()
{
	isPlaying = false;
	makelist();
}

function getSoc(id)
{
	for(i = 0; i < citedByArray.length; i++)
	{
		var obj = citedByArray[i];


		if(obj.importer1 == id)
		{
			return obj.soc1;
		}
		else if(obj.importer2 == id)
		{
			return obj.soc2;
		}
	}
	return null;
}

function getAllCasesCitedBy(theCase)
{
	var ret = [];
	for(i = 0; i < citedByArray.length; i++)
	{
		if(citedByArray[i].importer2 == theCase)
		{
			ret.push(citedByArray[i]);
		}
	}
	return ret;
}

function getAllCasesCites(theCase)
{
	var ret = [];
	for(i = 0; i < citedByArray.length; i++)
	{
		if(citedByArray[i].importer1 == theCase)
		{
			ret.push(citedByArray[i]);
		}
	}
	return ret;
}

function removeCitationList()
{
	var listContainer = parentHtml.getElementById('refList')
	while (listContainer.hasChildNodes()) {
		listContainer.removeChild(listContainer.lastChild);
	}
}

function showCitedBy(theCase)
{
	removeCitationList();
	
	var listContainer = parentHtml.getElementById('refList');
	var listData = getAllCasesCitedBy(theCase);
	var listData2 = getAllCasesCites(theCase);

	if(listData[0] != null)
	{
		var title = parentHtml.createElement("label")
		title.innerHTML = listData[0].importer2 + " (" + listData[0].soc2 + ")<br><br/>";
		listContainer.appendChild(title);
	}
	else if(listData2[0] != null)
	{
		var title = parentHtml.createElement("label")
		title.innerHTML = listData2[0].importer1 + " (" + listData2[0].soc1 + ")<br><br/>";
		listContainer.appendChild(title);
	}

	if(listData[0] != null)
	{	
	    var label = parentHtml.createElement("label");
	    label.innerHTML = "This case is cited By:";
	    listContainer.appendChild(label);
	

	    // Make the list itself which is a <ul>
	    var listElement = parentHtml.createElement("ul");
	    
	    // add it to the page
	    listContainer.appendChild(listElement);
	
	    // Set up a loop that goes through the items in listItems one at a time
	    var numberOfListItems = listData.length;
	
	
	    for( var i =  0 ; i < numberOfListItems ; ++i){
	
	            // create a <li> for each one.
	            var listItem = parentHtml.createElement("li");
	
	            // add the item text
	            listItem.innerHTML = listData[i].importer1 + " (" + listData[i].soc1 + ")";
	
	            // add listItem to the listElement
	            listElement.appendChild(listItem);
	    }
	}
	
	
	if(listData2[0] != null)
	{
		
	    var label = parentHtml.createElement("label");
	    label.innerHTML = "This case cites:";
	    listContainer.appendChild(label);
	
	    // Make the list itself which is a <ul>
	    var listElement = parentHtml.createElement("ul");
	    
	    // add it to the page
	    listContainer.appendChild(listElement);
	
	    // Set up a loop that goes through the items in listItems one at a time
	    var numberOfListItems = listData2.length;
	
	
	    for( var i =  0 ; i < numberOfListItems ; ++i){
	
	            // create a <li> for each one.
	            var listItem = parentHtml.createElement("li");
	
	            // add the item text
	            listItem.innerHTML = listData2[i].importer2 + " (" + listData2[i].soc2 + ")";
	
	            // add listItem to the listElement
	            listElement.appendChild(listItem);
	    }
	}
}
