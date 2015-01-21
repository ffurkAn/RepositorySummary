/**
 * RepoSummary is a tool to see issues organized and user progress visualized for milestones 
 * 
 * @author furkan.tanriverdi@unitbilisim.com
 * 
 */


var issueList = []; // Array to keep all issues for selected repo
var milestoneList = []; // Array to keep all milestones for selected repo 
var labelList = []; // Array to keep all labels for selected repo
var userList = []; // Array to keep all assignees for selected repo
var issueTable = []; // Array to keep issues which is filtered according to selected label(s), milestone(s) or assignee(s)
var table = null;

google.load("visualization", "1", {packages:["table","corechart"]});

angular.module('GitAPI', ['multi-select'])
.controller('GitHubCtrl', function($scope, $http, $parse) {
      	  		
	  
	
	  var reposNotFound = false;
	  
	  table = new google.visualization.Table(document.getElementById('table_div'));
	  
	  /**
	   * Function to draw Google Chart
	   */
	  $scope.drawChart = function() {


		  totalHoursToDo = 0;
		  totalHoursDone = 0;
		  totalHoursInProgress = 0;
		  table.clearChart();
		  
		  var selectedState = "all";
		  
		  /*
		  var selectedMilestone = "all";
		  var selectedLabel = "all";
		  var selectedUser = "all";

		  */		  
		  var milestoneSelected = false;
		  var userSelected = false;
		  var labelSelected = false;
		  
		  var data = new google.visualization.DataTable();
		  //data.addColumn('number', 'Nr.');
		  data.addColumn('string', "State");
		  data.addColumn('string', 'Issue');
		  data.addColumn('string', 'Progress');
		  data.addColumn('string', 'Task');
		  data.addColumn('string', 'Assignee');
		  data.addColumn('string', 'Milestone');
		  data.addColumn('string', 'Effort Required');
		  //data.addColumn('number', 'Total Hours');


		  //alert($scope.resultLabels.length);
		  /*
		  angular.forEach( $scope.resultLabels, function( value, key ) {
			    if ( value.ticked === true ) {
			        alert(value.name);
			    }
			});
		  */
		  
		  if($scope.resultState.length > 0){
			  angular.forEach( $scope.resultState, function( value, key ) {
				    if ( value.ticked === true ) {
				        selectedState = value.name;
				    }
				});
		  }

		  var conditionString = "if(";

		  if(selectedState == "all"){

			  conditionString += '("open" == issueTable[i][0] || '
				  + '"closed" == issueTable[i][0]) ' ;

		  }else if(selectedState == "open"){

			  conditionString += '"open" == issueTable[i][0] ';

		  }else if(selectedState == "closed(done)"){

			  conditionString += '"closed" == issueTable[i][0] ';
		  }

		  if($scope.resultMilestones != null && $scope.resultMilestones.length > 0){
			  
			  var counter = 0;
			  conditionString += ' && (';
			  angular.forEach( $scope.resultMilestones, function( value, key ) {
				    if ( value.ticked === true ) {
				    	if(counter > 0){
				    		conditionString += ' || ';
				    	}				    		
						conditionString += '"' + value.title + '" == issueTable[i][5] ';
						counter++;
				    }
				});
			  conditionString += ')';
		  }

		  if($scope.resultUsers != null && $scope.resultUsers.length > 0){

			  var counter = 0;
			  conditionString += ' && (';
			  angular.forEach( $scope.resultUsers, function( value, key ) {
				    if ( value.ticked === true ) {
				    	if(counter > 0){
				    		conditionString += ' || ';
				    	}				    		
						conditionString += '"' + value.login + '" == issueTable[i][4] ';
						counter++;
				    }
				});
			  conditionString += ')';
		  }

		  if($scope.resultLabels != null && $scope.resultLabels.length > 0){
			 
			  var counter = 0;
			  conditionString += ' && (';
			  angular.forEach( $scope.resultLabels, function( value, key ) {
				    if ( value.ticked === true ) {
				    	if(counter > 0){
				    		conditionString += ' || ';
				    	}				    		
				    	conditionString += '"' + value.name + '" == issueTable[i][2] || "' 
						  + value.name + '" == issueTable[i][3] || "' 
						  + value.name + '" == issueTable[i][6] ';
						counter++;
				    }
				});
			  conditionString += ')';
		  }


		  conditionString += ')';

		  var totalHours = "";

		  totalHours += 'if(issueTable[i][6].charAt(1) == "h"){';

		  totalHours += '	var h = parseInt(issueTable[i][6].charAt(0));'

			  totalHours += '	if(issueTable[i][2] == "todo"){'
				  totalHours += '	totalHoursToDo = totalHoursToDo + h;}'
			  
				  totalHours += 'if(issueTable[i][2] == "done"){'
					  totalHours += 'totalHoursDone = totalHoursDone + h;}'

				  totalHours += 'if(issueTable[i][2] == "in progress"){'
			     		totalHours += '	totalHoursInProgress = totalHoursInProgress + h;}'											

		  totalHours += '	}'

		totalHours += 'if(issueTable[i][6].charAt(1) == "d"){'

			totalHours += '	var d = parseInt(issueTable[i][6].charAt(0));'

		  totalHours += '	if(issueTable[i][2] == "todo"){'
				totalHours += 'totalHoursToDo = totalHoursToDo + d*8;}'

			totalHours += '	if(issueTable[i][2] == "done"){'
			totalHours += '		totalHoursDone = totalHoursDone + d*8;}'

			totalHours += '	if(issueTable[i][2] == "in progress"){'
			totalHours += '		totalHoursInProgress = totalHoursInProgress + d*8;}'

		totalHours += '	}';


		  if(issueTable.length > 0){

			  for(i = 0; i < issueTable.length; i++) {

				  //eval("alert(issueTable[i]);");
				  eval(conditionString + "{ " + 
						  "data.addRow(issueTable[i]);"+ totalHours +"}");

			  }
			  			  
			  document.getElementById('table_div').setAttribute("style","display:block");
			  			  
			  table.draw(data, {showRowNumber: true});			  
		  }
	  }
	   
	   /**
	    * Function to fetch all repositories for an organization
	    */
	   $scope.getRepos = function() {
		    
		   if($scope.orgname == null || $scope.orgname == ""){
		    	//$scope.orgname = "modelwriter";
		    	
		    	var the_string = 'orgname';

		    	// Get the model
		    	var model = $parse(the_string);

		    	// Assigns a value to it
		    	model.assign($scope, "modelwriter");

		    	// Apply it to the scope
		    	//$scope.$apply();
		    	//console.log($scope.life.meaning);
		    }
		  
		    var sprintCharts = document.getElementById('sprintCharts');
			 while (sprintCharts.firstChild) {
				 sprintCharts.removeChild(sprintCharts.firstChild);
			}
			document.getElementById('table_div').setAttribute("style","display:none"); 
			
			$scope.reposLoaded = false;
			$scope.labelsNotFound = false;
			$scope.labelsLoaded = false;
			$scope.usersNotFound = false;
			$scope.usersLoaded = false;
			$scope.milestonesNotFound = false;
			$scope.milestonesLoaded = false;
			$scope.statesNotFound = false;
			$scope.statesLoaded = false;
			$scope.progressChartNotFound = false;
			$scope.buttonLoaded = false;
			$scope.milestoneNotSelected = false;
		    
			$http.get("https://api.github.com/orgs/"+$scope.orgname+"/repos").success(function(data) {
						
						$scope.reposNotFound = false;
						$scope.repos = data;				
						$scope.selectedRepo = null;									
						$scope.reposLoaded = true;
						//table.clearChart();
						
						
						issueTable = [];
					}).error(function () {
						   
						   $scope.reposNotFound = true;
					   });
								
	   }
	   
	   /**
	    * Function to fill out select boxes
	    */
	$scope.fillFields = function(){
		var sprintCharts = document.getElementById('sprintCharts');
		while (sprintCharts.firstChild) {
			 sprintCharts.removeChild(sprintCharts.firstChild);
		 }

		  
		issueList = [];
		milestoneList = [];
		labelList = [];
		userList = [];
		issueTable = [];
		
	    $scope.labelsNotFound = false;
	    $scope.usersNotFound = false;
		$scope.milestonesNotFound = false;
		$scope.statesNotFound = false;
		$scope.progressChartNotFound = false;
		
		
		document.getElementById('table_div').setAttribute("style","display:none");
		
				$http.get("https://api.github.com/repos/"+$scope.orgname+"/"+$scope.selectedRepo.name+"/issues?state=all&per_page=1000").success(function (data) {//Getting issues for org and repo
			
						for(j in data){
				
							issueList.push(data[j]);
						}	
						issueParse();
												
							if(labelList.length > 0){
								$scope.selectedLabel = null;
								$scope.labelsLoaded = true;
								$scope.labels = labelList;
							}else{
								
								$scope.labelsLoaded = false;
								$scope.labelsNotFound = true;
								$scope.selectedLabel = null;
							}
							

							if(milestoneList.length > 0){
								$scope.selectedMilestone = null;
								$scope.milestonesLoaded = true;
								$scope.milestones = milestoneList;
							}else{
							
								$scope.milestonesLoaded = false;
								$scope.milestonesNotFound = true;	
								$scope.selectedMilestone = null;
								$scope.progressChartNotFound = true;
							}
						

							if(userList.length > 0){
								$scope.selectedUser = null;
								$scope.usersLoaded = true;
								$scope.users = userList;
							}else{
								
								$scope.usersLoaded = false;
								$scope.usersNotFound = true;
								$scope.selectedUser = null;
								$scope.progressChartNotFound = true;
							}
							
							
							if(issueList.length > 0){
								$scope.selectedState = null;
								$scope.statesLoaded = true;
								$scope.states = [
								                 {name:'open'},
								                 {name:'closed(done)'}
								               ];
								$scope.buttonLoaded = true;
							}else{
								
								$scope.statesLoaded = false;
								$scope.statesNotFound = true;
								$scope.buttonLoaded = false;
								$scope.selectedState = null;
							}
							
							
							if($scope.progressChartNotFound == true){
								$scope.milestoneNotSelected = false;
							}else{
								$scope.milestoneNotSelected = true;
							}							
						
				}).error(function (data,status,as, config) {
 			
					alert(data+status+config);
        	 
				});
		
		
		/**
		 * Function to create issue tables
		 */
		function issueParse (){		
			

			for(var i in issueList){// For every issue in List
				
				var value = [];// Table Row

				value.push(issueList[i].state);
				var state = issueList[i].state;
				
				value.push(issueList[i].title);
				
				
				if(issueList[i].labels.length != 0){
					findProgress(value,issueList[i]);					
					findTask(value,issueList[i].labels);
					
				}else if(state == "closed"){
					value.push("done");
					value.push("no task assigned");
				}else {
					
					value.push("no progress assigned");
					value.push("no task assigned");
				}
				
				
				if(issueList[i].assignee != null){
					
					value.push(issueList[i].assignee.login);
					
					if(!isUserExist(issueList[i].assignee)){
						userList.push(issueList[i].assignee);
					}
					
				}else {
					value.push("no assignee");
				}
				

				if(issueList[i].milestone != null){
					
					value.push(issueList[i].milestone.title);
					
					if(!isMilestoneExist(issueList[i].milestone)){
						milestoneList.push(issueList[i].milestone);
					}
				}else {
					value.push("no milestone");
				}
				

				if(issueList[i].labels.length != 0){
					findEffort(value,issueList[i].labels);
					
					fillLabels(issueList[i].labels);					
				}else {
					
					value.push("no effort");
				}
				
				
				issueTable.push(value);
			}
		}
		
		/**
		 * function to find issue's progress state
		 */
		function findProgress(v,issue){
			
			for(i in issue.labels){


				if(issue.state == "closed"){
					v.push("done");
					return;
				}else if(issue.labels[i].name == "todo" || issue.labels[i].name == "in progress"){//find state of the issue
					v.push(issue.labels[i].name);
					
					return;
				} 
				
				
			}
			v.push("no progress");
		}
		
		/**
		 * Function to find issue's task
		 */
		function findTask(v,labels){
			
			var str;
			
			for(i in labels){
					
				if(labels[i].name.match(/(T[0-9]+)/)){
					v.push(labels[i].name);
					return;
				}
			}
			v.push("no task");
		}
		
		/**
		 * Function to find issue's effort assigned to assignee
		 */
		function findEffort(v,labels){
			
			for(var i = 0; i < labels.length; i++){
				
				if(labels[i].name.match(/[1-9][h,d]|(10)[h,d]/) != null){
					v.push(labels[i].name);
					return;
				}	
			}
			v.push("no effort");
		}
		
		/**
		 * Function to find issue's labels
		 */
		function fillLabels(labels){
			
			for(var i in labels){
				
				if(!isLabelExist(labels[i])){
					labelList.push(labels[i]);
				}
			}
		}
		
		/**
		 * Function to know if label exists
		 */
		function isLabelExist(label){
				
			var exist = false;
				
			for(var i in labelList){
					
				    if (labelList[i].name == label.name)
				    	exist = true;
				}
				return exist;		
		}
		
		/**
		 * Function to know if milestone exists
		 */
		function isMilestoneExist(milestone){
			
			var exist = false;
				
			for(var i in milestoneList){
					
				    if (milestoneList[i].title == milestone.title)
				    	exist = true;
				}
				return exist;		
		}
		
		/**
		 * Function to know if user exists
		 */
		function isUserExist(user){
			
			var exist = false;
				
			for(var i in userList){
					
				    if (userList[i].login == user.login)
				    	exist = true;
				}
				return exist;		
		}
		
		
	
	}
	
	/**
	 * Function to draw progress charts for users
	 */
	$scope.drawUserProgressChart = function () {
		
		var counter = 0;
		var selectedMilestones = [];
		
		angular.forEach( $scope.resultMilestones, function( value, key ) {
			if ( value.ticked === true ) {
				selectedMilestones.push(value.title);
			}
		});
		

		var selectedMilestone = "";
		
		var sprintCharts = document.getElementById('sprintCharts');
		while (sprintCharts.firstChild) {
			 sprintCharts.removeChild(sprintCharts.firstChild);
		 }
		
		
		if(selectedMilestones.length == 0){
			
			$scope.milestoneNotSelected = true;
			
		}else {
			
			$scope.milestoneNotSelected = false;
			
			for(x = 0; x < selectedMilestones.length; x++){
				 				
					 var completedHours;
					 var toDoHours;
					 var row = [];
					 var container = [];
					 
					 container.push(["Assignee","To Do","Done"]);
					 
					 for(i = 0; i < userList.length; i++){
						  	
						 row = [];
						 
						 completedHours = 0;
						 toDoHours = 0;
						  for(j = 0; j <issueTable.length; j++){
							  
							  if(issueTable[j][4] == userList[i].login && issueTable[j][5] == selectedMilestones[x]){

								  if(issueTable[j][6].charAt(1) == "h"){ ;

								  var h = parseInt(issueTable[j][6].charAt(0)); 

								  if(issueTable[j][2] == "todo"){ 
									  toDoHours = toDoHours + h;} 

								  if(issueTable[j][2] == "done"){ 
									  completedHours = completedHours + h;} 

								  if(issueTable[j][2] == "in progress"){ 
									  toDoHours = toDoHours + h;} 											

								  } 

								  if(issueTable[j][6].charAt(1) == "d"){ 

									  var d = parseInt(issueTable[j][6].charAt(0)); 

									  if(issueTable[j][2] == "todo"){ 
										  toDoHours = toDoHours + d*8;} 

									  if(issueTable[j][2] == "done"){ 
										  completedHours = completedHours + d*8;} 

									  if(issueTable[j][2] == "in progress"){ 
										  toDoHours = toDoHours + d*8;} 

								  }
							  }
						  } // end for issueTable
						  
						  row.push(userList[i].login);
						  row.push(toDoHours);
						  row.push(completedHours);
						  
						  container.push(row);
					  } // end for users
					 
					 
					 var data = new google.visualization.arrayToDataTable(container);
					  
					 
					  var title = "Assignee Performance for " + selectedMilestones[x]; 
					  var options = {
							  title: title,
							  hAxis: {title: 'Assignees', titleTextStyle: {color: 'black'}}
					  };
					  
					  var newDiv = document.createElement('div');
					  newDiv.id = 'chart_div'+x;
					  document.getElementById('sprintCharts').appendChild(newDiv);
					  
					  var chart = new google.visualization.ColumnChart(document.getElementById(newDiv.id));
					  
					  
					  chart.draw(data, options);
				  
			 } 
		}
		
		
	}
	
	
});
