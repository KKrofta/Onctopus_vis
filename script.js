var 	//file parameters
	relationshipFileEnding = ".Z",
	resultFileEnding = ".json",

	//Parameters of the circle graphic of the nodes
	radius = 13,
	circleStrokeWidth = 2,

	//edge parameters
	edgeWidth = 1,
	edgeSelectorWidth = 10,
	directEdgeDash = "10, 0",
	certainEdgeDash= "5, 2",
	ambiguousEdgeDash = "1, 3",

	//Position adjustment of the id and freqency in the tree
	idxChange = "-0.33em",
	idyChange = "0.4em",
	freqyChange = idyChange,
	freqSpacer = 5,

	//Parameters of the svg working area of the legend
	legHeight = 300,
	legWidth = 500,
	legMargin = {top: 30, right: 0, bottom: 30, left: 30},
	legTxtSpacer = 10,

	//defines how much the name of the tree is shifted to the bottom
	treeNameBottomShift = 40,

	//Parameters of the svg working area of the tree
	width = 500,
	height = 500,
	margin = {top: 30, right: 30, bottom: 30, left: 30},

	//Beginnin of the id of the tree group without the treeId
	treeGId = "treeG";

	//parameters for the distance of the Mutation Graphic from the path
	mutationGraphicXOffset = 3,
	mutationGraphicYOffset = 3,

	//defines the y-axis space between the mutation graphics on one edge
	mutGraphicSpacer = 5,

	//CNV graphic parameters
	cnvRectHeigth = 20,
	cnvRectWidth = 5,
	cnvRectColorA = "rgb(0,0,255)",
	cnvRectColorB = "rgb(255,0,0)",

	//mutation graphic text parameters
	cnvTextSpacer = 3,
	cnvTextYOffset = -1,
	mutTextHeigth = 15,

	//animation parameter
	animationDuration = 1000,

	//legend parameters
	legFontSize = 12,
	legSeperatorFontSize = mutTextHeigth + 4,
	legRefWidth = 110,
	legSpace =  + legFontSize/4,

	//PDF parameters
	pdfTreeScale = 1,
	pdfFontSize = 16,
	pdfFontXOffset = pdfFontSize / 8;

//Amount of created trees
var treeCounter = 0
//contains all data of every tree
var trees = {};
//maximal amount of segments in the current trees
var segmentAmount = 0;

this.world = function world() {
	console.log("world!");
}

function test() {

}

//generates the visualisation of the data
function draw() {
	drawLegend();

	if(document.getElementById("data").files.length==0) {
		alert("No File selected!");
		return;
	}
	readRelationFiles();
	return;
}

//Fills the legendGroup with the text and and graphics. The mutation graphics use the same functions as in the actual tree. The graphs are generated with seperate functions.
function drawLegend() {
	var legend = d3.select("#legendG");

	var p1 = {"x":0, "y":0};
	var p2 = {"x":legRefWidth, "y":0};
	var legendLen = 9;
	var cur = {"c": 1};
	var stepsize = legHeight / (legendLen - 1)
	var txtX = p2.x + legTxtSpacer

	if(legend.empty()) {
		legend = d3.select("#legendGroup").append("svg")
			.attr("id", "legendSVG")
			.attr("width", legWidth + legMargin.right + legMargin.left)
			.attr("height", legHeight + legMargin.top + legMargin.bottom)
			.append("g")
			.attr("id", "legendG")
			.attr("font-size", legFontSize)
			.attr("transform", "translate(" + legMargin.left + "," + legMargin.top + ")");

		genLegEdgeElem(legend, "black", directEdgeDash, p1, p2, "parent-child relationship", txtX, cur, stepsize);

		genLegEdgeElem(legend, "black", certainEdgeDash, p1, p2, "ancestor-descendant relationship,\ncurrently parent-child relationship", txtX, cur, stepsize);

		genLegEdgeElem(legend, "black", ambiguousEdgeDash, p1, p2, "ambiguous relationship", txtX, cur, stepsize);

		genLegEdgeElem(legend, "blue", directEdgeDash, p1, p2, "activated parent-child relationship", txtX, cur, stepsize);

		genLegEdgeElem(legend, "blue", certainEdgeDash, p1, p2, " activated ancestor-descendant relationship,\ncurrently parent-child relationship", txtX, cur, stepsize);

		var grp = legend.append("g")._groups[0][0];
		grp.__data__  = {"id": 0, "x": 0, "y": 1, "parent": {"x": 0, "y": -1}};
		addMutationGraphicsForSSM(grp, 0, 1, 2, 3);



		var w = legend.append("text")
			.attr("dx", txtX)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.text("SSM numbers on segment:")
		var w = legend.append("text")
			.attr("dx", txtX)
			.attr("dy", p1.y + 5 + legFontSize)
			.attr("font-size", legFontSize)
			.text("unphased | phased to")
			._groups[0][0].getBoundingClientRect().width + legSpace;
		w += legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5 + legFontSize)
			.attr("font-size", legFontSize)
			.style("fill", cnvRectColorA)
			.text("allele A")
			._groups[0][0].getBoundingClientRect().width + legSpace;
		w += legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5 + legFontSize)
			.attr("font-size", legFontSize)
			.text("| phased to")
			._groups[0][0].getBoundingClientRect().width + legSpace;
		legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5 + legFontSize)
			.attr("font-size", legFontSize)
			.style("fill", cnvRectColorB)
			.text("allele B");

		grp.setAttribute("transform", "translate(" + -mutationGraphicXOffset + "," + p1.y + ")");

		p1.y = stepsize * cur.c;
		p2.y = p1.y;
		cur.c += 1;

		var grp = legend.append("g")._groups[0][0];
		//adding graphic for duplication of allele A
		grp.__data__  = {"id": 0, "x": 0, "y": 1, "parent": {"x": 0, "y": -1}};
		addMutationGraphicsForCNV(grp, 0, [{"change": 1}], cnvRectColorA, cnvRectColorA);

		//adding text
		var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		grp.append(text);
		text.setAttribute("x", grp.getBoundingClientRect().width + cnvTextSpacer);
		cnvHalfHeigthDif = (cnvRectHeigth - mutTextHeigth)/2;
		text.setAttribute("y", mutTextHeigth + cnvHalfHeigthDif + cnvTextYOffset - grp.getBoundingClientRect().height /  2);
		text.setAttribute("font-size", legSeperatorFontSize);	
		var textNode = document.createTextNode("/");
		text.appendChild(textNode);

		//adding graphic for duplication of allele B
		var w = grp.getBoundingClientRect().width + cnvTextSpacer;
		grp.__data__.x  = w;
		grp.__data__.parent.x  = w;
		addMutationGraphicsForCNV(grp, 0, [{"change": 1}], cnvRectColorB, cnvRectColorB);

		var w = legend.append("text")
			.attr("dx", txtX)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.text("duplication of")
			._groups[0][0].getBoundingClientRect().width + legSpace;

		w += legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.style("fill", cnvRectColorA)
			.text("allele A")
			._groups[0][0].getBoundingClientRect().width + legSpace;

		w += legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.text("/")
			._groups[0][0].getBoundingClientRect().width + legSpace;

		legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.style("fill", cnvRectColorB)
			.text("allele B");

		grp.setAttribute("transform", "translate(" + -mutationGraphicXOffset + "," + p1.y + ")");

		p1.y = stepsize * cur.c;
		p2.y = p1.y;
		cur.c += 1;

		var grp = legend.append("g")._groups[0][0];
		//adding graphic for loss of allele A
		grp.__data__  = {"id": 0, "x": 0, "y": 1, "parent": {"x": 0, "y": -1}};
		addMutationGraphicsForCNV(grp, 0, [{"change": -1}], cnvRectColorA, cnvRectColorA);

		//adding text
		var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		grp.append(text);
		text.setAttribute("x", grp.getBoundingClientRect().width + cnvTextSpacer);
		cnvHalfHeigthDif = (cnvRectHeigth - mutTextHeigth)/2;
		text.setAttribute("y", mutTextHeigth + cnvHalfHeigthDif + cnvTextYOffset - grp.getBoundingClientRect().height /  2);
		text.setAttribute("font-size", legSeperatorFontSize);	
		var textNode = document.createTextNode("/");
		text.appendChild(textNode);

		//adding graphic for loss of allele B
		var w = grp.getBoundingClientRect().width + cnvTextSpacer;
		grp.__data__.x  = w;
		grp.__data__.parent.x  = w;
		addMutationGraphicsForCNV(grp, 0, [{"change": -1}], cnvRectColorB, cnvRectColorB);



		var w = legend.append("text")
			.attr("dx", txtX)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.text("loss of")
			._groups[0][0].getBoundingClientRect().width + legSpace;
		w += legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.style("fill", cnvRectColorA)

			.text("allele A")
			._groups[0][0].getBoundingClientRect().width + legSpace;
		w += legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.text("/")
			._groups[0][0].getBoundingClientRect().width + legSpace;
		legend.append("text")
			.attr("dx", txtX + w)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.style("fill", cnvRectColorB)
			.text("allele B");

		grp.setAttribute("transform", "translate(" + -mutationGraphicXOffset + "," + p1.y + ")");

		p1.y = stepsize * cur.c;
		p2.y = p1.y;
		cur.c += 1;

		var grp = legend.append("g")._groups[0][0];
		//adding graphic for loss of heterozygosity of allele A
		grp.__data__  = {"id": 0, "x": 0, "y": 1, "parent": {"x": 0, "y": -1}};
		addMutationGraphicsForCNV(grp, 0, [{"change": 0}], cnvRectColorA, cnvRectColorA);

		legend.append("text")
			.attr("dx", txtX)
			.attr("dy", p1.y + 5)
			.attr("font-size", legFontSize)
			.text("duplication of allele A and loss of allele B");

		grp.setAttribute("transform", "translate(" + -mutationGraphicXOffset + "," + p1.y + ")");
	}
}

//generates the graphic for an edge element in the legend. legend is the legend group, stroke is the color of the edge, dash is the dasharray of the edge, p1 is the starting point of the edge and p2 the ending point, text is the text to the right of the edge "\n" define linebrakes, txtX is the x position of the text cur the number that determines what legend element it is and stepsize the space between two legend elements.
function genLegEdgeElem(legend, stroke, dash, p1, p2, text, txtX, cur, stepsize, path) {
	legend.append("path")
		.attr("stroke", stroke)
		.attr("stroke-width", edgeWidth)
		.attr("stroke-dasharray", dash)
		.attr("d", pathstring(p1, p2));

	var t = legend.append("text")
		.attr("font-size", legFontSize);
	text = text.split("\n");
	var i = 0;
	text.forEach(function(line) {
		t.append("tspan")
			.attr("x", txtX)
			.attr("dy", function() {
				if(i == 0) {
					return p1.y + 5; 
				} else {
					return legFontSize * i;
				}
			})
			.text(text[i]);
		i++;
	});

	p1.y = stepsize * cur.c;
	p2.y = p1.y;
	cur.c += 1;
}

//checks every file in the input element 'data'. If the file has the correct ending, defined in 'relationshipFileEnding', a new tree is generated using the data in that file. If a file is found with same name but the ending defined in 'resultFileEnding' the data it contained is read in as mutation information and mutation graphics can be generated. //TODO catch invalid files with correct ending
function readRelationFiles() {
	//check if the browser supports neccessary packages
	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
		alert("The File APIs are not fully supported in this browser.");
	}

	//get the files from the input element
	var files = document.getElementById("data").files;

	//iterate over every file
	for(i = 0; i < files.length; i++) {
		var file = files[i];
		var resultFile = null;
		//check if the file has correct ending to be a relationship file
		if(file.name.length > relationshipFileEnding.length && file.name.slice(-relationshipFileEnding.length) == relationshipFileEnding) {
			//iterate over every file to find result file
			for(j = 0; j < files.length; j++) {
				var resFile = files[j]
				//check if the filename of the file equals the filename of the relationship file and has the correct ending
				if(resFile.name.length == file.name.length + resultFileEnding.length - relationshipFileEnding.length && file.name.slice(0, -relationshipFileEnding.length) == resFile.name.slice(0, -resultFileEnding.length)) {
					resultFile = resFile;
					break;
				}
			}

			var treeId = "" + treeCounter;
			//add a new tree to the tree data
			trees[treeId] = {"relations": [], "originalRelations": [], "selectedEdges": [], "resultArray": [], "segmentAmount": 0, "tree": null, "root": null, "oldPos": [], "filename": file.name.slice(0, -relationshipFileEnding.length)};
			treeCounter++;

			var reader = new FileReader();

			//add a function to the reader that triggers when a file is read
			reader.onload = (function(treeId, resultFile) {
				return function() {
					//store the relationship data
					try {
						trees[treeId].relations = JSON.parse(this.result);
						trees[treeId].originalRelations = JSON.parse(this.result);
					//reading in the result file, also starts the generation of the tree visualisation
					readResultFile(treeId, resultFile);
					} catch(SyntaxError) {
						alert(trees[treeId].filename + "" +  relationshipFileEnding + " is not a json-file!");
					}
				};
			})(treeId, resultFile);

			reader.readAsText(file);
		}
	};
}

//reades the given 'file' that should contain the mutations and frequencies of tree with given 'treeId'. Also starts the generation of the visualisation.
function readResultFile(treeId, file) {
	//check if the browser support neccessary packages
	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
		alert("The File APIs are not fully supported in this browser.");
	}

	if (file != null) {
		var reader = new FileReader();

		//add a function to the reader that triggers when a file is read
		reader.onload = function() {
			var tree = trees[treeId];
			try {
				tree.resultArray = JSON.parse(this.result);

				//going through every mutation to find the segment with the highest id
				tree.resultArray.forEach(function(link) {
					tree["segmentAmount"] = checkSegments(link.ssms, tree["segmentAmount"]);
					tree["segmentAmount"] = checkSegments(link.ssms_a, tree["segmentAmount"]);
					tree["segmentAmount"] = checkSegments(link.ssms_b, tree["segmentAmount"]);
					tree["segmentAmount"] = checkSegments(link.cnvs_a, tree["segmentAmount"]);
					tree["segmentAmount"] = checkSegments(link.cnvs_b, tree["segmentAmount"]);
				});
				if(segmentAmount < tree["segmentAmount"]) {
					//adding an option to the segment selection for each segment
					var select = document.getElementById("segmentSelect");
					for(var i = segmentAmount + 1; i <= tree["segmentAmount"]; i++) {
						var option = document.createElement("option");
						option.setAttribute("value", i - 1);
						option.innerHTML = "segment " + (i - 1);
						select.append(option);
					}
					segmentAmount = tree["segmentAmount"];
				}
			} catch (SyntaxError) {
				alert(trees[treeId].filename + "" +  resultFileEnding + " is not a json-file! Tree was generated without mutations.");
			}
			
			//generates the elements for the visualisation
			afterRead(treeId, false);
		}

		reader.readAsText(file);
	} else { //no result file selected
		afterRead(treeId, false);
	}
}

//checks mutArray for the highest id and updated segmentAmount if the segment has a higher id than segmentAmount
function checkSegments(mutArray, segmentAmount) {
	mutArray.forEach(function(mut) {
		if(mut.seg_index > segmentAmount - 1) {
			segmentAmount = mut.seg_index + 1;
		}
	});
	return segmentAmount;
}

//generates the visualisation after the relations array has been read from a file. Set segSelect to true if the only thing changed is the selected segment
function afterRead(treeId, segSelect) {
	var treeData = arrayToJSON(trees[treeId].relations, trees[treeId].originalRelations);
	//draw the tree
	svg = d3.select("#" + treeGId + treeId);
	drawTree(treeData, treeId, segSelect);
	//generate the tables
	if (trees[treeId].resultArray != null) {
		drawMutationTable(trees[treeId].resultArray);
		drawFreqTable(trees[treeId].resultArray);
	}
}

//Generating a kinship tree in JSON-format from the input array
function arrayToJSON(array, sourceArray){

	//checking if array is not containing valid values for descendant <= predecessor
	for(pre=0;pre<array.length;pre++){
		for(desc=0;desc<=pre;desc++){
			if(array[pre][desc]!=-1){
				alert("Invalid array: " + pre + ", " + desc + " is not '-1'");
				return [[],[]];
			}
		}
	}

	//contains the information for the main tree generation
	var jsonTree = [];

	//Adding every node
	for(i=0; i<array.length; i++){
		jsonTree.push({"id": i, "possibleChildren": new Array(array.length).fill(0), "uncertainParent": false});
	}

	//Setting up the relations by moving the nodes into the children array of their parent starting with the descendant with the highest index and checking for predecessors in a bottom up manner on the matrix. This means starting with the node that has the highest index and can be a parent.
	for(desc=array.length-1;desc>0;desc--){
		var preFound = false;
		for(pre=desc-1;pre>=0;pre--){
			if(array[pre][desc]==1){
				if(!preFound){ //parent child relationship
					//determine if the relation is really certain or if the relation has been selected by the user
					if(sourceArray[pre][desc]==0) {
						jsonTree[desc]["selected"] = true;
					} else {
						jsonTree[desc]["selected"] = false;
					}

					//adding children array if needed and not existing yet
					if(typeof jsonTree[pre].children === 'undefined') {
						jsonTree[pre]["children"] = [];
					}
					//moving the currently selected descendant into the children array of his predecessor
					jsonTree[pre].children.unshift(jsonTree[desc]);
					//removing the predecessor from the array
					jsonTree = jsonTree.slice(0,desc).concat(jsonTree.slice(desc+1));
				
					preFound=true;
				}
			//setting the entry with same id than descendant in the possibleChildren array of the predecessor to 1 to represent that the descendant is a possible but not certain child of the predecessor
			} else if(array[pre][desc]==0) {
				jsonTree[pre].possibleChildren[desc]=1;
			//catching invalid values in the array
			} else if(array[pre][desc]!=-1) {
				alert("Invalid value at " + pre + ", " + desc + " in the array!");
				return [[],[]];
			}
		}

	}

	//removes all possible children, that won't be drawn in the topological tree
	determinePossibleChildren (jsonTree[0], array);

	return jsonTree[0];
}

//removes all possible children from each node of the given tree which are inferable by the children and possible children of the other nodes
function determinePossibleChildren (jsonTree, array) {
	jsonTree.children.forEach(function (child) {
		dPC(child, array);
	});
}

//removes the possible children of the lineage that are inferable using the relationship array array and recursively doing the same with all of the children of the lineage
function dPC (lineage, array) {
	for(i=0; i<lineage.possibleChildren.length; i++) {
		if(lineage.possibleChildren[i] == 1) {
			//removes all possible children from the lineage which are certain children of the possible child
			for(j=i; j<array[i].length; j++) {
				if(array[i][j]==1){
					lineage.possibleChildren[j] = 0;
				}
			}
		}
	}
	//applying the function to every child
	if (lineage.children != null) {
		lineage.children.forEach(function (child) {
			dPC(child, array);
		});
	}
}

//------------------------------------------TREE GENERATION------------------------------------------------

//creates the tree graphic
function drawTree(treeData, treeId, segSelect) {
	var svg = d3.select("#" + treeGId + treeId);

	//creating an svg working area with a group that will contain all of the svg objects if there is no working area for the tree already
	if(svg.empty()) {
		//add container group and pdf button
		var pdf = d3.select("#graphsGroup")
			.append("g")
			.attr("id", "tree" + treeId)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.style("position", "relative")
			.append("button")
			.attr("onclick", "getPDF(" + treeId + ")")
			.style("position", "absolute")
			.style("left", margin.left + "px")
			.html("get PDF");

		//add remove button
		var del = d3.select("#tree" + treeId)
			.append("button")
			.attr("onclick", "removeTree(" + treeId + ")")
			.style("position", "absolute")
			.style("right", margin.right + "px")
			.html("remove");

		svg = d3.select("#tree" + treeId)
			.append("svg")
			.attr("id", "treeSVG" + treeId)
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom + treeNameBottomShift)
			.append("g")
			.attr("id", treeGId + treeId)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var name = d3.select("#tree" + treeId)
			.append("span")
			.style("position", "absolute")
			.style("bottom", margin.bottom + "px")
			.html(trees[treeId].filename);
		var nWidth = name._groups[0][0].getBoundingClientRect().width;
		name.style("left", margin.left + width/2 - nWidth/2 + "px");
	}

	//creating an object that is responsible for placing the nodes to where they belong to
	var tree = d3.tree().size([height, width]);
	trees[treeId].tree = tree;
	
	//declaring the root of the tree and his position, this is necessary for the tree to be able to sort the nodes
	root = d3.hierarchy(treeData, function(d) {return d.children;});
	root.x0 = 0;
	root.y0 = width/2;
	trees[treeId].root = root;

	updateTree(treeId, segSelect);
}

//removes the tree with given treeId and adjusts the segment amount
function removeTree(treeId) {
	//remove three from trees
	delete trees[treeId];
	//remove tree graphic
	d3.select("#tree" + treeId).remove();
	//adjusts the amount of segments
	var oSA = segmentAmount;
	segmentAmount = 0;
	for (tId in trees) {
		var tree = trees[tId];
		if (segmentAmount < tree["segmentAmount"]) {
			segmentAmount = tree["segmentAmount"];
		}
	}
	select = document.getElementById("segmentSelect");
	for (i = oSA; i > segmentAmount; i--) {
		select.remove(i);
	}
}

//declaring the position of the children of the given root and appending graphics to them with the help of the given tree in the given svg working space.
function updateTree(treeId, segSelect) {
	var svg = d3.select("#" + treeGId + treeId);
	var root = trees[treeId].root;
	var tree = trees[treeId].tree;
	
	//Getting the arrays of nodes and links with coordinates given to them by the tree
	var 	treeData = tree(root),
		nodes = treeData.descendants(),
		links = treeData.descendants().slice(1);

	//sorting the nodes by their id
	nodes.sort(function (a, b) {
		return a.data.id - b.data.id;
	});

	for(i=1; i<nodes.length; i++) {
		//subdepth which decides which node has the larger depth in the tree if depth is equal. This is necessary for differentiating the depth of children and possible children
		nodes[i]["depth2"] = 0;
		//maximal possible parents depth: depth of the possible parent with the largest depth
		nodes[i]["maxPPD"] = 0;
		//maximal possible parents depth2: depth2 of the possible parent with the largest depth and depth2
		nodes[i]["maxPPD2"] = 0;
	}

	//array that stores the depth in the final tree of a node with depth d and depth2 d2 at position DD2toD[d][d2] for all nodes
	var DD2toD = [[0]];

	//calculating the depth of each node
	for(i=1; i<nodes.length; i++) {
		node = nodes[i];
		//since only nodes with lower id can be parents or possible parents the depth of a node can be calculated when the depth of all previous nodes has been calculated and is the depth of it's parent + 1 or the maximal depth of all of it's possible parents if it is larger than the depth of the parent. In that case the depth2 of the node has to be the depth2 of the maximal possible parent + 1
		if(node.parent.depth >= node.maxPPD) {
			node.depth = node.parent.depth + 1;
		} else {
			node.depth = node.maxPPD;
			node.depth2 = node.maxPPD2 + 1;
		}

		//updating the largest possible parent depth for each possible child of the node
		for(j=i+1; j<node.data.possibleChildren.length; j++) {
			if(node.data.possibleChildren[j]==1) { //nodes[j] is possible child
				if(node.depth > nodes[j].maxPPD) {
					nodes[j].maxPPD = node.depth;
					nodes[j].maxPPD2 = node.depth2;
				} else if(node.depth == nodes[j].maxPPD) {
					nodes[j].maxPPD2 = Math.max(node.depth2, nodes[j].maxPPD2);
				}
			}
		}

		//initialising the entry in DD2toD that will be used for this node
		if (DD2toD[node.depth] == null) {
			DD2toD.push([0]);
		} else if (DD2toD[node.depth][node.depth2] == null) {
			DD2toD[node.depth].push(0);
		}
	}

	//calculating the final depths in DD2toD
	var maxDepth = 0;
	for(i=1; i<DD2toD.length; i++) {
		for(j=0; j<DD2toD[i].length; j++) {
			maxDepth += 1;
			DD2toD[i][j] = maxDepth;
		}
	}

	//calculating the new y-distance between nodes of 1 depth difference. and applying the new y coordinates to the nodes
	var stepsize = height/maxDepth;

	//moving the nodes to their final y coordinates
	for(i=1; i<nodes.length; i++) {
		nodes[i].y = DD2toD[nodes[i].depth][nodes[i].depth2]*stepsize;
	}

	//creating a path between each node and their possible children
	nodes.forEach(function (n) {
		pCh = n.data.possibleChildren;
		for(i=0; i<pCh.length; i++) {
			if(pCh[i] == 1) {
				var e = nodes[i];
				links.push({x: e.x,y: e.y, id: e.data.id, data: {uncertainParent: false, selected: false, id: e.data.id}, ambiguous: true, parent: n});

				//stores that the possible childs direct parent might not be the one that belongs to the node that is currently parent.
				if(nodes[i].parent.data.id < n.data.id) {
					nodes[i].data.uncertainParent = true;
				}
			}
		}
	});

	//adding the nodes to the svg working area and applying id's to them
	var node = svg.selectAll("g.node").data(nodes, function(d) {return d.id || (d.id = d.data.id);});

	//moving the already present nodes to there new position
	node.transition()
		.duration(animationDuration)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"
		});

	//adding a group to a node that contains all svg graphics that belong to the node and moves them according to the position of the node
	var nodeEnter = node.enter().append("g")
		.attr("id", function(d) {
			return "ttg" + d.id;
		})
		.attr("class", "node")
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"
		});
	
	//adding the circle graphic to the node
	nodeEnter.append("circle")
		.attr("fill", "white")
		.attr("stroke", "black")
		.attr("stroke-width", circleStrokeWidth)
		.attr("r", radius);
	
	//adding the id text to the node
	nodeEnter.append("text")
		.attr("dx", idxChange)
		.attr("dy", idyChange)
		.text(function(d) {return d.id;});

	//adding the frequency text to the node
	if(trees[treeId].resultArray.length != 0) {
		nodeEnter.append("text")
			.attr("dx", radius + freqSpacer)
			.attr("dy", freqyChange)
			.text(function(d) {return trees[treeId].resultArray[d.id].freq;});
	} else {
		nodeEnter.append("text")
			.attr("dx", radius + freqSpacer)
			.attr("dy", freqyChange);
	}
	
	//Changing the id in data of the links to be unique, the id outside of data is still the descendant node id.
	links.forEach (function(link) {
		link.data.id = link.parent.id + "-" + link.id;
	});

	//adding the links to the svg working area and applying id's to them
	var link = svg.selectAll("g.link").data(links, function(d) {return d.data.id;});

	//adding the link graphics as paths and adds them to the group. There is already a group because the links array contains the same elements as the nodes array exept the first one which is only contained in the nodes array
	var linkGroups = link.enter().insert("g", "g")
		.attr("class", "link")
		.attr("id", function(d) {
			return "ce" + d.data.id;
		})
		.attr("selected", function(d) {
			return d.data.selected;
		})
		.attr("predecessor", function(d) {
			return d.parent.id;
		})
		.attr("descendant", function(d) {
			return d.id;
		});
	//adding new paths at the old position of their parent nodes
	//adding visible path
	linkGroups.insert("path", "g")
		.attr("class", "visLink")
		.attr("fill", "none")
		.attr("stroke-dasharray", function(d) {
			if(d.ambiguous) {
				return ambiguousEdgeDash;
			} else if(d.data.uncertainParent) {
				return certainEdgeDash;
			} else return directEdgeDash;
		})
		.attr("stroke" , "white")
		.attr("stroke-width", edgeWidth)
		.attr("d", function(d) {
			var oP = trees[treeId].oldPos[d.parent.id];
			if(oP) {
				return pathstring(oP, oP);
			}
        		return pathstring(d.parent, d.parent);
		})
		.on("click", function(d) {
			if(d.ambiguous) {
				selectEdge(this);
			} else {
				deselectEdge(this);
			}
		});
	//adding invisible path to make clicking easier
	linkGroups.insert("path", "g")
		.attr("class", "invisLink")
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-opacity", "0")
		.attr("stroke-width", "10")
		.attr("d", function(d) {
			var oP = trees[treeId].oldPos[d.parent.id];
			if(oP) {
				return pathstring(oP, oP);
			}
        		return pathstring(d.parent, d.parent);
		})
		.on("click", function(d) {
			if(d.ambiguous) {
				selectEdge(this);
			} else {
				deselectEdge(this);
			}
		});

	//adding label
	linkGroups.append("text")
		.attr("class", "label")
		.attr("dx", function(d) {
			var oP = trees[treeId].oldPos[d.parent.id];
			if(oP) {
				return oP.x;
			}
			return d.parent.x;
		})
		.attr("dy", function(d) {
			var oP = trees[treeId].oldPos[d.parent.id];
			if(oP) {
				return oP.y;
			}
			return d.parent.y;
		})
		.text("")
		.style("fill", "white")
		.on("click", function(d) {
			if(d.ambiguous) {
				selectEdge(this);
			} else {
				deselectEdge(this);
			}
		});

	//changing existing links to their new positions, color and stroke type
	var visLink = svg.selectAll("path.visLink").data(links, function(d) {return d.data.id;});
	var invisLink = svg.selectAll("path.invisLink").data(links, function(d) {return d.data.id;});
	var label = svg.selectAll("text.label").data(links, function(d) {return d.data.id;});

	//visible links
	visLink.transition()
		.duration(animationDuration)
		.attr("stroke-dasharray", function(d) {
			if(d.ambiguous) {
				return ambiguousEdgeDash;
			} else if(d.data.uncertainParent) {
				return certainEdgeDash;
			} else return directEdgeDash;
		})
		.attr("stroke" , function(d) {
			if(d.data.selected) {
				return "blue";
			} else return "black";
		})
		.attr("d", function(d) {
			if(d.ambiguous) {
        			return pathstringTT(d.parent, d)
			} else {
				return pathstring(d.parent, d)
			}
		});

	//invisible links
	invisLink.transition()
		.duration(animationDuration)
		.attr("d", function(d) {
			if(d.ambiguous) {
        			return pathstringTT(d.parent, d)
			} else {
        			return pathstring(d.parent, d)
			}
		});

	//label
	label.transition()
		.duration(animationDuration)
		.attr("dx", function(d) {
			return (3*d.parent.x + d.x) / 4;
		})
		.attr("dy", function(d) {
			return (d.parent.y + 3*d.y) / 4;
		})
		.text(function(d) {
			if(d.ambiguous) {
				return "?";
			} else {
				return "";

			}
		})
		.style("fill", function(d) {
			if(d.ambiguous) {
				return "black";
			} else {
				return "white";

			}
		});
	
	//removing old links
	//also removing the group of the links
	link.exit().transition().duration(animationDuration).remove();
	visLink.exit().transition().duration(animationDuration)
		.attr("stroke", "white")
		.attr("stroke-width", 0)
		.attr("d", function(d) {
			var p = nodes[d.data.id.split("-")[0]];
			return pathstring(p, p);
		})
		.remove();
	invisLink.exit().remove();
	label.exit().transition().duration(animationDuration)
		.attr("dx", function(d) {
			var p = nodes[d.data.id.split("-")[0]];
			return p.x;
		})
		.attr("dy", function(d) {
			var p = nodes[d.data.id.split("-")[0]];
			return p.y;
		})
		.style("fill", "white")
		.remove();

	//store the positions of the nodes in oldPos for the next change in the tree
	nodes.forEach(function(d){
		trees[treeId].oldPos[d.id] = {x: d.x, y: d.y};
	});

	//removing old mutation graphics
	svg.selectAll("g.mut").remove();
	
	//add graphic for mutations
	if (trees[treeId].resultArray.length != 0) {
		if(segSelect) {
			addMutationGraphic(svg.selectAll("g.link"), treeId);
		} else {
			setTimeout(function(){
				addMutationGraphic(svg.selectAll("g.link"), treeId);
			}, animationDuration);
		}
	}
}

//Generates a string that defines the path used to connect two points directly a bezier curve is used so that the animations work properly
function pathstring(p, d) {
	return "M" + p.x + " " + p.y + " Q " + (p.x + d.x)/2 + " " + (p.y + d.y)/2 + " " + d.x + " " + d.y;
}

//Generates a string that defines the path used to connect two points with a bezier curve
function pathstringTT(p, d) {
	return "M" + p.x + " " + p.y + " Q " + p.x + " " + d.y + " " + d.x + " " + d.y;
}

//click handler for an uncertain edge that calculates the new relationship matrix if the edge would be selected, updates the selectedEdges array and updates the visualisation.
function selectEdge(e) {
	var p = e.parentElement;
	var treeId = p.parentElement.id.slice(treeGId.length);
	var tree = trees[treeId];
	//changing the tree
	activate_relation(treeId, [[p.getAttribute("predecessor"), p.getAttribute("descendant")]]);
	//storing the selection
	tree.selectedEdges.push([p.getAttribute("predecessor"), p.getAttribute("descendant")]);
}

//sends a message to the server that requests that all of the relations send in rel will be activated one after another. the message contains the function identifier, the relation matrix and the rel array afterwards the server sends a response containing the new relations matrix which will be saved. Then the visualisation will be updated.
function activate_relation (treeId, rel) {
	var tree = trees[treeId];
	$.ajax({
		type: "POST",
		url: "server.py",
		data: {"fct": "activate_relation", "mat": "[["+tree.relations.join("],[")+"]]", "relations": "[["+rel.join("],[")+"]]"},
		success: function (response) {
			tree.relations = JSON.parse(response);
			afterRead(treeId, false)
		},
		error: function (error) {
			console.log("An error has occured!");
			console.log(error);
		}
	});
}

//Click handler for a selected edge. Removes the selected edge and all from the selectedEdges array, resets relations to originalRelations and then calculates the new relations matrix if all edges in selectedEdges would be selected. Afterwards the visualisation is updated.
function deselectEdge(e) {
	var sEdge = e.parentElement;
	if(sEdge.getAttribute("selected")) {
		var treeId = sEdge.parentElement.id.slice(treeGId.length);
		var tree = trees[treeId];
		var predId = sEdge.getAttribute("predecessor");
		var descId = sEdge.getAttribute("descendant");
		//implied descendants through this relation
		var imDe = [];
		//this is needed for when a edge is added to selectedEdges before a tree changes so that the edge is no longer in that form in the tree and thus prevents deselection of this edge by implying it.
		//edges that imply the deselected edge are those that start at the predecessor node and end in either the descendant node or one of the descendants' descentants
		for (i = descId; i < tree.relations.length; i++) {
			if (tree.relations[descId][i] == 1) {
				//storing the id's of the nodes descending from the descentant node
				imDe.push(i);
			}
		}
		for (i = 0; i < tree.selectedEdges.length; i++) {
			var edge = tree.selectedEdges[i];
			//removing the edge if it has the same predecessor as the deselected edge and a descendant that either is the same than the one in the deselected edge or a descendant of it
			if(edge[0] == predId && (edge[1] == descId || imDe.includes(parseInt(edge[1])))) {
				tree.selectedEdges.splice(tree.selectedEdges.indexOf(edge), 1);
				i--;
			}
		}
		//resetting the relations and reapplying all still remaining selected edges
		tree.relations = tree.originalRelations.slice(0);
		activate_relation(treeId, tree.selectedEdges);
	}
}

//Adds the graphics for the mutations on the edges in linkGroups
function addMutationGraphic(linkGroups, treeId) {
	linkGroups._groups[0].forEach(function(link) {
		if(!link.__data__.ambiguous) {
			var selectedSegment = document.getElementById("segmentSelect").value;
			var mutations = trees[treeId].resultArray[link.getAttribute("descendant")];

			//remove the mutations that are not on the selected segment and split the ssms into those that affect the cnv and those that do not
			var cnvsA = filterMuts(mutations["cnvs_a"], selectedSegment);
			var cnvsB = filterMuts(mutations["cnvs_b"], selectedSegment);
			var ssms = splitSSMs(filterMuts(mutations["ssms"], selectedSegment));
			var ssmsA = splitSSMs(filterMuts(mutations["ssms_a"], selectedSegment));
			var ssmsB = splitSSMs(filterMuts(mutations["ssms_b"], selectedSegment));

			//detect lohs and duplications and deletions on both alleles
			checkForMultiAlleleCNV(cnvsA, cnvsB, mutations);

			//determine the position of the mutations and generate their graphics
			var mutGraphicAmount = 0;
			if(cnvsA.length > 0 || cnvsB.length > 0) {
				mutGraphicAmount += 1;
			}
			if(ssms["preCNV"].length > 0 || ssmsA["preCNV"].length > 0 || ssmsB["preCNV"].length > 0) {
				mutGraphicAmount += 1;
			}
			if(ssms["pastCNV"].length > 0 || ssmsA["pastCNV"].length > 0 || ssmsB["pastCNV"].length > 0) {
				mutGraphicAmount += 1;
			}
			//The sum of posShift for all mutation types is 0. The difference between the posShift of adjecent mutation types is always 1.
			var posShift = - (mutGraphicAmount-1) * 0.5;
			if(ssms["preCNV"].length > 0 || ssmsA["preCNV"].length > 0 || ssmsB["preCNV"].length > 0) {
				addMutationGraphicsForSSM(link, posShift, ssms["preCNV"].length, ssmsA["preCNV"].length, ssmsB["preCNV"].length);
				posShift += 1;
			}
			if(cnvsA.length > 0) {
				addMutationGraphicsForCNV(link, posShift, cnvsA, cnvRectColorA, cnvRectColorB);
				posShift += 1;
			}
			if(cnvsB.length > 0) {
				addMutationGraphicsForCNV(link, posShift, cnvsB, cnvRectColorB, cnvRectColorA);
				posShift += 1;
			}
			if(ssms["pastCNV"].length > 0 || ssmsA["pastCNV"].length > 0 || ssmsB["pastCNV"].length > 0) {
				addMutationGraphicsForSSM(link, posShift, ssms["pastCNV"].length, ssmsA["pastCNV"].length, ssmsB["pastCNV"].length);
			}
		}
	});
}

//returns an array that only contains the mutations in muts that are on the segment with the number segmenNumber
function filterMuts(muts, segmentNumber) {
	var filteredMuts = [];
	muts.forEach(function(mut) {
		if(mut.seg_index == segmentNumber) {
			filteredMuts.push(mut);
		}
	});
	return filteredMuts;
}

//splitts the ssms into two arrays. The first "preCNV" contains those that affect the cnv on the same segment. The second "pastCNV" contains those that do not.
function splitSSMs(muts) {
	var preCNV = [];
	var pastCNV = [];
	muts.forEach(function(mut) {
		if(mut.infl_cnv_same_lin == true) {
			preCNV.push(mut);
		} else {
			pastCNV.push(mut);
		}
	});
	return {"preCNV": preCNV, "pastCNV": pastCNV};
}

//checks the type of multi allele CNV if both alleles have an allele. It is expected that both arrays only contain 1 element and the mutations are on the same segment.
function checkForMultiAlleleCNV(cnvsA, cnvsB, mutations) {
	if(cnvsA[0] != null && cnvsB[0] != null) {
		var a = mutations["cnvs_a"];
		var b = mutations["cnvs_b"];
		//checking for LOHs
		if(cnvsA[0].change == 1 && cnvsB[0].change == -1) {
			var i = b.indexOf(cnvsB[0]);
			b.splice(i, 1);
			cnvsB.splice(0,1);
			cnvsA[0].change = 0;
		} else if(cnvsA[0].change == -1 && cnvsB[0].change == 1) {
			var i = a.indexOf(cnvsA[0]);
			a.splice(i, 1);
			cnvsA.splice(0,1);
			cnvsB[0].change = 0;
		//checking for duplications on both alleles
		} else if(cnvsA[0].change == 1 && cnvsB[0].change == 1) {
			var i = b.indexOf(cnvsB[0]);
			b.splice(i, 1);
			cnvsB.splice(0,1);
			cnvsA[0].change = 2;
		//checking for deletions on both alleles
		} else if(cnvsA[0].change == -1 && cnvsB[0].change == -1) {
			var i = b.indexOf(cnvsB[0]);
			b.splice(i, 1);
			cnvsB.splice(0,1);
			cnvsA[0].change = -2;
		}
	}
}

//Generates the graphic for a cnv in mutArray on the edge link at position posShift using color for the rectangle color. It is expected that mutArray only contains one cnv.
function addMutationGraphicsForCNV(link, posShift, mutArray, color, secondaryColor) {
	var d = link.__data__;
	mutArray.forEach(function(mut) {

		//creating group
		var grp = document.createElementNS("http://www.w3.org/2000/svg", "g");
		link.appendChild(grp);
		grp.setAttribute("id", "mutationGraphicGroup" + d.id); //not unique!!!
		grp.setAttribute("class", "mut");

		//adding rectangle
		var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		grp.append(rect);
		rect.setAttribute("width", cnvRectWidth);
		rect.setAttribute("height", cnvRectHeigth);
		rect.setAttribute("style", "fill:" + color);
		rect.setAttribute("x", 0);
		rect.setAttribute("y", 0);

		if(mut.change == -2 || mut.change == 2) {
			var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			grp.append(rect);
			rect.setAttribute("width", cnvRectWidth);
			rect.setAttribute("height", cnvRectHeigth);
			rect.setAttribute("style", "fill:" + secondaryColor);
			rect.setAttribute("x", cnvRectWidth + cnvTextSpacer);
			rect.setAttribute("y", 0);
		}

		//adding text
		var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		grp.append(text);
		if(mut.change == -2 || mut.change == 2) {
			text.setAttribute("x", 2 * (cnvRectWidth + cnvTextSpacer));
		} else {
			text.setAttribute("x", cnvRectWidth + cnvTextSpacer);
		}
		cnvHalfHeigthDif = (cnvRectHeigth - mutTextHeigth)/2;
		text.setAttribute("y", mutTextHeigth + cnvHalfHeigthDif + cnvTextYOffset);
		text.setAttribute("font-size", mutTextHeigth);	
		if(mut.change == 1 || mut.change == 2) {
			var textNode = document.createTextNode("dupl.");
			text.appendChild(textNode);
		} else if(mut.change == -1 || mut.change == -2) {
			var textNode = document.createTextNode("loss");
			text.appendChild(textNode);
		} else if(mut.change == 0) {
			var textNode = document.createTextNode("LOH.");
			text.appendChild(textNode);
		}

		//moving to correct position
		var indentLeft = 0;
		if((d.x - d.parent.x) / (d.y - d.parent.y) < 0) {
			indentLeft = -grp.getBoundingClientRect().width;
		}
		var pos = mutGetPos(link, posShift, indentLeft);
		var xpos = pos.x;
		var ypos = pos.y;
		grp.setAttribute("transform", "translate(" + xpos + "," + (ypos) + ")");
	});
}

//returns the position of the graphic on the edge link at position posShift shifted to the left by indentLeft (this is necessary for element that are left of the edge where indentLeft should be the width of the element, otherwise it should be 0)
function mutGetPos(link, posShift, indentLeft) {
	var d = link.__data__;
		//solution to desired heigth = 0,5 * (d.y + d.parent.y) + posShift * (mutGraphicSpacer + cnvRectHeigth) + cnvRectHeigth/2 = a * d.y + (1 - a) * d.parent.y
		//0,5 * (d.y + d.parent.y) is the center between the two nodes
		//posShift * (mutGraphicSpacer + cnvRectHeigth) is the heightmodification to space out multiple different mutations
		//cnvRectHeigth/2 sets the center of the rectangle as reference point instead of its top
		var a = 0.5 + (posShift * (mutGraphicSpacer + cnvRectHeigth) + cnvRectHeigth/2) / (d.y-d.parent.y);
		var b = 1 - a;
		var xa = a*d.x;
		var xb = b*d.parent.x;
		var ya = a*d.y;
		var yb = b*d.parent.y;
		var xpos = xa + xb + sign(d.x-d.parent.x)*mutationGraphicXOffset + indentLeft;
		var ypos = ya + yb - cnvRectHeigth - mutationGraphicYOffset;
		return {"x": xpos, "y":ypos};
}

//sign function that sets 0 as a positive number
function sign(num) {
	if(num < 0) {
		return -1;
	} else {
		return 1;
	}
}

//Generates the graphic for the ssms on the edge link at position posShift when there are ssmCount ssms on both homologous segments, ssmACount ssms on segment A and ssmBCount ssms on segment B.
function addMutationGraphicsForSSM(link, posShift, ssmCount, ssmACount, ssmBCount) {
	var d = link.__data__;

	//create group
	var grp = document.createElementNS("http://www.w3.org/2000/svg", "g");
	link.appendChild(grp);
	grp.setAttribute("id", "mutationGraphicGroup" + d.id); //not unique!!!
	grp.setAttribute("class", "mut");

	//add text
	var x = {"val": 0};
	grp.append(generateTextElement(ssmCount, x, "black"));
	x.val = grp.getBoundingClientRect().width;
	grp.append(generateTextElement("|", x, "black"));
	x.val = grp.getBoundingClientRect().width;
	grp.append(generateTextElement(ssmACount, x, cnvRectColorA));
	x.val = grp.getBoundingClientRect().width;
	grp.append(generateTextElement("|", x, "black"));
	x.val = grp.getBoundingClientRect().width;
	grp.append(generateTextElement(ssmBCount, x, cnvRectColorB));

	//move group to correct position
	var indentLeft = 0;
	if((d.x - d.parent.x) / (d.y - d.parent.y) < 0) {
		indentLeft = -grp.getBoundingClientRect().width;
	}
	var pos = mutGetPos(link, posShift, indentLeft);
	var xpos = pos.x;
	var ypos = pos.y;
	grp.setAttribute("transform", "translate(" + xpos  + "," + (ypos) + ")");
}

//Generates a textnode containing text that is shifted to the right by x and uses textcolor color.
function generateTextElement(content, x, color) {
	var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.setAttribute("x", x.val);
	text.setAttribute("y", mutTextHeigth);
	text.setAttribute("font-size", mutTextHeigth);
	text.setAttribute("fill", color);

	var textNode = document.createTextNode(content);
	text.appendChild(textNode);

	return text;
}

//-------------------------------------Frequency Table--------------------------------------------------

//generates the frequency table into tableGroup based on resultArray
function drawFreqTable(resultArray) {

	var table = d3.select("#frequencyTable");

	//creating an svg working area with a group that will contain all of the svg objects if there is no working area for the tree already
	if(table.empty()) {
		table = d3.select("#tableGroup").append("g")
			.attr("id", "frequencyTableG")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append("table")
			.attr("id", "frequencyTable")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("border", "black")
			.attr("border-collapse", "collapse");
	//clearing the group of the tree if there is a svg working area for the tree already
	} else table.selectAll("*").remove();

	updateFreqTable(resultArray);
}

//update the frequency table based on resultArray
function updateFreqTable(resultArray) {
	table = document.getElementById("frequencyTable");

	//add headers
	var row = table.insertRow(0);
	row.insertCell(0).innerHTML = "Lineage";
	row.insertCell(1).innerHTML = "Frequency";
	
	//add values
	var i = 0;
	resultArray.forEach(function(d){
		var row = table.insertRow(i+1);
		row.insertCell(0).innerHTML = i;
		row.insertCell(1).innerHTML = resultArray[i]["freq"];
		i++;
	});
}

//-------------------------------------Mutation Table---------------------------------------------------

//generate the mutation table into tableGroup based on resultArray
function drawMutationTable(resultArray) {

	var table = d3.select("#mutationTable");

	//creating an svg working area with a group that will contain all of the svg objects if there is no working area for the tree already
	if(table.empty()) {
		table = d3.select("#tableGroup").append("g")
			.attr("id", "mutationTableG")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append("table")
			.attr("id", "mutationTable")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("border", "black")
			.attr("border-collapse", "collapse");
	//clearing the group of the tree if there is a svg working area for the tree already
	} else table.selectAll("*").remove();

	updateMutationTable(resultArray);
}

//update the mutation table based on resultArray
function updateMutationTable(resultArray) {
	var table = document.getElementById("mutationTable");

	//Adding the title of the table
	var row = table.insertRow(0);
	var cell = row.insertCell(0)
	cell.setAttribute("colspan", "5");
	cell.innerHTML = "Mutations";

	//Adding the column headers
	row = table.insertRow(1);
	row.insertCell(0).innerHTML = "Lineage";
	row.insertCell(1).innerHTML = "Type";
	row.insertCell(2).innerHTML = "Segment";
	row.insertCell(3).innerHTML = "Chromosome";
	row.insertCell(4).innerHTML = "Position";

	//filling in the values for each lineage
	var linIndex = 0;
	resultArray.forEach(function(lin){
		//adding the lineage ids
		row = table.insertRow(-1);
		cell = row.insertCell(0);
		cell.innerHTML = linIndex;
		//setting the hight of the id-cell to the amount of mutations plus the amount of mutation types not present in the lineage
		var mutAmount = 0;
		mutAmount = addMuts(mutAmount, lin["ssms"].length);
		mutAmount = addMuts(mutAmount, lin["ssms_a"].length);
		mutAmount = addMuts(mutAmount, lin["ssms_b"].length);
		mutAmount = addMuts(mutAmount, lin["cnvs_a"].length);
		mutAmount = addMuts(mutAmount, lin["cnvs_b"].length);
		cell.setAttribute("rowspan", mutAmount);

		//adding the mutations to the table
		insertMutations(lin["ssms"], table, "SSMs", 0, row);
		insertMutations(lin["ssms_a"], table, "SSM_As", 0, null);
		insertMutations(lin["ssms_b"], table, "SSM_Bs", 0, null);
		insertMutations(lin["cnvs_a"], table, "CNV_As", 1, null);
		insertMutations(lin["cnvs_b"], table, "CNV_Bs", 1, null);

		linIndex++;
	});
}

//increases mutAmount by min(mutArrayLen, 1) if mutArrayLen is positiv
function addMuts(mutAmount, mutArrayLen) {
	if(mutArrayLen == 0) {
		mutAmount += 1;
	} else {
		mutAmount += mutArrayLen;
	}
	return mutAmount;
}

//inserts the mutations in mutationArray to the table. The mutation type will be set as typeName. If a row is given it will be used for the first mutation. Mode 0 is used for ssms and mode 1 for cnvs
function insertMutations(mutationArray, table, typeName, mode, row) {
	if(row == null) {
		row = table.insertRow(-1);
		row.insertCell(-1).style = "display:none";
	}
	//adding the type-cell
	cell = row.insertCell(-1);
	cell.innerHTML = typeName;
	if(mutationArray.length != 0) {
		cell.setAttribute("rowspan", mutationArray.length);
	}

	//adding segment, chromosome and position values
	var first = true;
	mutationArray.forEach(function(mut) {
		//creating only a new row if mutation is not in the same row as the type-cell
		if(first) {
			first = false;
		} else {
			row = table.insertRow(-1);
		}
		row.insertCell(-1).style = "display:none";
		row.insertCell(-1).style = "display:none";
		row.insertCell(-1).innerHTML = mut["seg_index"];
		row.insertCell(-1).innerHTML = mut["chr"];
		if(mode == 0) {
			row.insertCell(-1).innerHTML = mut["pos"];
		} else if (mode == 1) {
			row.insertCell(-1).innerHTML = mut["start"] + " - " + mut["end"];
		}
	});
}

//redraws all the trees with the currently selected segment.
function changeSegment() {
	for (var treeId in trees) {
		afterRead(treeId, true);
	}
}

//generates pdf for all the trees
function getPDFs() {
	for (tId in trees) {
		getPDF(tId);
	}
}

//generates the pdf of the tree with given id out of the svg graphic in it's current state
function getPDF(treeId) {
	//pdf set up
	var doc = new PDFDocument({
		size: [width + margin.left + margin.right, height + margin.top + margin.bottom],
		margins: {
			top: margin.top,
			bottom: margin.bottom,
			left: margin.left,
			right: margin.right
		}
	});
	var stream = doc.pipe(blobStream());
	
	var g = document.getElementById(treeGId + treeId);
	doc.translate(margin.right, margin.top);
	doc.scale(pdfTreeScale);
	doc.fontSize(pdfFontSize);

	//add elements
	var labels = [];
	for (i=0; i<g.children.length; i++) {
		var g2 = g.children[i];
		for (j=0; j<g2.children.length; j++) {
			var elem = g2.children[j];
			addToPDF(doc, elem);
			if(elem.nodeName == "g") {
				var tf = elem.getAttribute("transform");
				if (tf != null && tf.length >= 9 && tf.substring(0, 9) == "translate") {
					tf = tf.substring(0, tf.length - 1);
					tf = tf.split("(");
					tf = tf[1].split(",");
				}
				for (k=0; k<elem.children.length; k++) {
					addToPDF(doc, elem.children[k], tf);
				}
			}
		}
	}
	
	doc.end();
	stream.on("finish", () => {
		blob = stream.toBlob("application/pdf");
		url = stream.toBlobURL("application/pdf");
		window.open(url);
	});
}

//Creates an element and adds it to doc. The element is based one elem with transformation tf in mind. This function is designed to work specifically with the graph svg and won't work for most other svgs depending on the elements used.
function addToPDF(doc, elem, tf) {
	//is this elem part of a mutation graphic
	var mutGraph = true;
	if (tf == null) {
		tf = ["0", "0"];
		mutGraph = false;
	}
	if(elem.nodeName == "path" && elem.getAttribute("stroke") != "white") {
		var dsh = elem.getAttribute("stroke-dasharray");
		//converting the color into an array of rgb values
		var color = elem.getAttribute("stroke");
		color = color.slice(4, -1);
		color = color.split(", ");
		if(dsh != null) {
			dsh = dsh.split(", ");
			doc.path(elem.getAttribute("d"))
				.dash(parseInt(dsh[0]), {space: parseInt(dsh[1])})
				.lineWidth(edgeWidth)
				.stroke(color)
				.undash();
		} else {
			doc.path(elem.getAttribute("d"))
				.lineWidth(edgeWidth)
				.stroke(color);
		}
	} else if(elem.nodeName == "circle") {
		//parentElement coordinates have to be used because they store the actuall positions used by d3
		doc.circle(elem.parentElement.__data__.x, elem.parentElement.__data__.y, parseInt(elem.getAttribute("r")))
			.lineWidth(circleStrokeWidth)
			.fillAndStroke("white", "black");
		doc.stroke();
	} else if(elem.nodeName == "text") {
		var fill = elem.getAttribute("fill");
		if (fill == null) {
			fill = "black";
		} else if (fill.length >= 3 && fill[0] == "r" && fill[1] == "g" && fill[2] == "b") {
			fill = fill.substring(0, fill.length - 1);
			fill = fill.split("(");
			fill = fill[1].split(",");
		}

		var fontSize = pdfFontSize;
		//dx, dy are used by the text elements on the nodes and edges except the mutation graphics
		var x = parseInt(elem.getAttribute("dx"));
		var y = parseInt(elem.getAttribute("dy"));
		if (isNaN(x)) {
			//For the mutation graphics normal x and y are used
			x = parseInt(elem.getAttribute("x"));
			y = parseInt(elem.getAttribute("y"));
		}
		if(elem.getAttribute("class") != "label" && !mutGraph) {
			//space the node text elements to the right
			x = x - pdfFontSize * 3 / 8 + pdfFontXOffset;
			y = y - pdfFontSize * 3 / 8;


			//adjust to the position of the containing group
			x += elem.parentElement.__data__.x;
			y += elem.parentElement.__data__.y;
		} else if (mutGraph) {
			//mutation graphic position needs to be adjusted depending on graphic size and transformation by the containing group
			y = y - cnvRectHeigth * 1/2; //TODO not working for scaling text sizes (mutTextHeigth)
			fontSize = elem.getAttribute("font-size");
			x += parseInt(tf[0]);
			y += parseInt(tf[1]);
		}
		doc.fontSize(fontSize)
			.fillColor(fill)
			.text(elem.innerHTML, x, y);
	} else if(elem.nodeName == "rect") {
		var fill = elem.style.fill;
		if (fill.length >= 3 && fill[0] == "r" && fill[1] == "g" && fill[2] == "b") {
			fill = fill.substring(0, fill.length - 1);
			fill = fill.split("(");
			fill = fill[1].split(", ");
		}
		doc.rect(elem.getAttribute("x") + parseInt(tf[0]), elem.getAttribute("y") + parseInt(tf[1]), elem.getAttribute("width"), elem.getAttribute("height"))
			.fillAndStroke(fill, fill);
		doc.stroke();
	}
}
