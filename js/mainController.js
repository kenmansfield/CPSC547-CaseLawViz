angular.module('app', []);

angular.module('app').controller('mainCntrl', ['$scope', 
function ($scope) {

  $scope.master = {}; // MASTER DATA STORED BY YEAR

  
  //Need to get the years based on the range of years of the cases.
  $scope.selected_year = 2013;
  $scope.years = d3.range(2014, 1950, -1);

  $scope.filters = {};
  $scope.hasFilters = false;
  var steps=[1,2,5,10,25,50,100,200]
  //$scope.th=5;


  //$scope.hasFilters = true;
//  new Dragdealer("sizefilter", {
//		x: 5/6,
//		steps: 7,
//		snap: true,
//		animationCallback: function(a, b) {
//			d3.select("#sizefilterhandle").text(steps[Math.round(6 * a)]+'k');
//		},
//		callback: function(a, b) {
//			$scope.th = Math.round(6 * a);
//			$scope.update();
//		}
//	});
	
  $scope.tooltip = {};

  // FORMATS USED IN TOOLTIP TEMPLATE IN HTML
  $scope.pFormat = d3.format(".1%");  // PERCENT FORMAT
  $scope.qFormat = d3.format(",.0f"); // COMMAS FOR LARGE NUMBERS

  $scope.updateTooltip = function (data) {
    $scope.tooltip = data;
    $scope.$apply();
  }

  $scope.addFilter = function (name) {
    $scope.hasFilters = true;
    $scope.filters[name] = {
      name: name,
      hide: true
    };
    $scope.$apply();
  };
  
  
  
  $scope.update = function () {
    //var data2 = $scope.master[$scope.selected_year];	
    var data2 = $scope.master[2013];	
    
	if (data2) {
		var data=data2.filter(function (d) 
				{
			//TODO: flow should be an ordinal (or create a new ordinal) and selected_year should be case # ordinal


			
			if ((d.importer1  <= $scope.selected_year)) {
				return true;
			}
			return false;
		})
	}
    if (data && $scope.hasFilters) {
      $scope.drawChords(data.filter(function (d) {
        var fl = $scope.filters;
        var v1 = d.importer1, v2 = d.importer2;

        if ((fl[v1] && fl[v1].hide) || (fl[v2] && fl[v2].hide)) {
          return false;
        }
        return true;
      }));
    } else if (data) {
      $scope.drawChords(data);
    }
  };
  
  $scope.updateData = function (data) {
	  $scope.master[2013] = [];
	  console.log("update data called!!!");
	  var year;
	    data.forEach(function (d) {
	    d.year  = +d.year;
	    d.flow1 = +d.flow1;
	    d.flow2 = +d.flow2;
	    
	    console.log(d.importer1);
	
	    //if (!$scope.master[d.year]) {
	      //$scope.master[d.year] = []; // STORED BY YEAR
	    //}
	    //$scope.master[d.year].push(d);
	    
//	    if (!$scope.master[2013]) {
//		      $scope.master[2013] = []; // STORED BY YEAR
//		    }
	    $scope.master[2013].push(d);
	    year = d.importer1;
	  })
	  //$scope.selected_year = year;
	  $scope.update();
  };
 
  $scope.$watch('selected_year', $scope.update);
  $scope.$watch('filters', $scope.update, true);

}]);