/**
 * 
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
var referenceMatrix = [];

var chart;

var theUsername = "kenmansfield";
var thePassword = "l1IJD9bzklvKHXto0lojGk78ujdzE7J7";

var parentHtml;

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
	
	var caseNumber = form.theCaseNum.value;
	var caseYear =  form.theCaseYear.value;
	
	url = "http://app.knomos.ca/api/cases/bcca/" + caseYear + 
	"/" + caseNumber + "/citations";
		
	caseIndices.push("" + caseYear + caseNumber);
	namesArray.push("" + caseYear + caseNumber);
	
	newRequest();
}

function statusFinishedLoading(data)
{
	parentHtml.getElementById('iframe2').contentWindow.document.getElementById("errorMessage").innerHTML = "Loaded";
	parentHtml.getElementById('iframe1').contentWindow.angular.element("body").scope().updateData(data);
}
 
function statusLoading(loadedIndex)
{
	parentHtml.getElementById('iframe2').contentWindow.document.getElementById("errorMessage").innerHTML = "Loading: " + loadedIndex;	
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
	
	xmlhttp.setRequestHeader ("Authorization", "Basic " + btoa("kenmansfield" + ":" + "l1IJD9bzklvKHXto0lojGk78ujdzE7J7"));
	//xmlhttp.setRequestHeader ("Authorization", "Basic " + btoa(theUsername + ":" + thePassword));	
	xmlhttp.send();
}

function referenceLoad(response)
{
	caseArray.push(parseFunction(response, index));
	
	//okay, that response is hopefully parsed.
	//parse everything that it has loaded.
	
	var arrayLength = caseArray[0].length;
	
	if( arrayLength <= index)
	{
		//Now we've built an array with all the 1st and 2nd degree citations.
		//Next we need to build our dependency matrix.
		//First, we need the labels for each.
		//need to go through entire array to get unique id's.
		createUniqueNameList();
		
		//now build our matrix!
		//referenceMatrix = buildMatrix();
		
		//With our matrix, and our name list we can now create our d3 wheel!!!!
		//doD3();
		
		//Doing this differently now. Just gonna do pairings.
		LoadD3Data();
		return;
	}
	
	caseIndices.push("" + caseArray[0][index].case_year + caseArray[0][index].case_num);
	
	url = "http://app.knomos.ca/api/cases/bcca/" + caseArray[0][index].case_year + 
		"/" + caseArray[0][index].case_num + "/citations";
		
	index++;
	newRequest();

	//increment so.
}

//This function stores all of the citations for that case into the
//array at the index.
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
		if(caseObj.case_num && caseObj.case_year)
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
			//probably need to change this to somethign more informative. 
			var name = "" + caseArray[i][j].case_year + caseArray[i][j].case_num;
			if(namesArray.indexOf(name) == -1)
			{
				namesArray.push(name);
			}
		}
	}
}
var loadedData = [];
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
					var tempString = "" + caseArray[caseArrayIndice][z].case_year + caseArray[caseArrayIndice][z].case_num;
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

var citedByArray = [];

function LoadD3Data()
{
	for(i = 0; i < namesArray.length; i++)
	{
		var caseArrayIndice = caseIndices.indexOf(namesArray[i]);
		
		//Check if we find that array. of course we do, we put it in there.
		if( caseArrayIndice >= 0 )
		{
			for(z = 0; z < caseArray[caseArrayIndice].length; z++)
			{
				var theCase = caseArray[caseArrayIndice][z];
				var tempString = "" + theCase.case_year + theCase.case_num;
				
				//if(tempString == namesArray[i])
				{
					if(theCase.cited_by == false)
					{
						var obj = {};
						obj.importer1 = namesArray[i];
						obj.importer2 = tempString;
						obj.flow1 = 2;
						obj.flow2 = 1;
						obj.year = theCase.case_year;
						citedByArray.push(obj);
					}
				}
			
			}
		}
	}
	
	parentHtml.defaultView.updateTimeSlider(citedByArray.length - 1);
	statusFinishedLoading(citedByArray);
}

function compare(a,b) {
	  if (a.importer1 < b.importer1)
	    return -1;
	  if (a.importer1 > b.importer1)
	    return 1;
	  return 0;
	}

function getSelectedCase(index)
{
	if(citedByArray)
	{
		var theArray = citedByArray.sort(compare);
		
		if(index < citedByArray.length)
		{
			return theArray[index].importer1;
		}
	}
	return 0;
	
}