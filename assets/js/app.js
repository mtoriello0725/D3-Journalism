// SVG Figure:

svgWidth = 960;
svgHeight = 500;

var margin = {
	top: 20,
	left: 100,
	bottom: 80,
	right: 40
}

width = svgWidth - margin.left - margin.right;
height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);

var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial X-axis 
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

// Create function for xscale
function xScale(acsData, chosenXaxis) {

	var XLinearScale = d3.scaleLinear()
		.domain([d3.min(acsData, d => d[chosenXaxis]) * 0.8,
			d3.max(acsData, d => d[chosenXaxis]) * 1.2])
		.range([0,width]);

	return XLinearScale;
}

// Create function for yscale
function yScale(acsData, chosenYaxis) {

	var YLinearScale = d3.scaleLinear()
		.domain([d3.min(acsData, d => d[chosenYaxis]) * 0.8,
			d3.max(acsData, d => d[chosenYaxis]) * 1.2])
		.range([height,0]);

	return YLinearScale;
}

// Function for rendering new axes 
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function for rendering new axes 
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function for updating circles group
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]))
    .attr("cy", d => newYScale(d[chosenYaxis]));

    return circlesGroup;
}

// Function for updating toolTip with updated circles group
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {

	// check which x-axis label triggered the event
	switch (chosenXaxis) {
		case "poverty":
			xlabel = "poverty";
			break;
		case "age":
			xlabel = "age";
			break;
		case "income":
			xlabel = "income";
	}

	// check which y-axis label triggered the event
	switch (chosenYaxis) {
		case "healthcare":
			ylabel = "healthcare";
			break;
		case "obesity":
			ylabel = "obesity";
			break;
		case "smokes":
			ylabel = "smokes";
	}

	// initialize tooltip
	var toolTip = d3.tip()
		.attr("class", "tooltip")
		.offset([80, -50])
		.html(function(d) {
			return (`${d.state} - ${d.abbr}<br>${xlabel} - ${d[chosenXaxis]}`);
		});

	// Add tooltip to the chart
	circlesGroup.call(toolTip);

	console.log(toolTip);

	// Add mouseover and mouseout functionality
	circlesGroup.on("mouseover", function(tipData) {

		toolTip.show(tipData); // something is wrong here with the input
	})
		.on("mouseout", function(tipData) {
			toolTip.hide(tipData);
		});

	return circlesGroup;
}

// select csv and create scatter plot with above functions 
d3.csv("data.csv").then(function(acsData) {

	// parse data:
	acsData.forEach(function(data) {
		data.poverty = +data.poverty;
		data.age = +data.age;
		data.income = +data.income;
		data.obesity = +data.obesity;
		data.smokes = +data.smokes;
		data.healthcare = +data.healthcare;
	})

	// x and y scale functions
	var XLinearScale = xScale(acsData, chosenXaxis);
	var YLinearScale = yScale(acsData, chosenYaxis);

	// Create initial axes functions 
	var BottomAxis = d3.axisBottom().scale(XLinearScale);
	var LeftAxis = d3.axisLeft().scale(YLinearScale);

	var xAxis = chartGroup.append("g")
		.classed("x-axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(BottomAxis)

	var yAxis = chartGroup.append("g")
		.classed("y-axis", true)
		.call(LeftAxis)

	var circlesGroup = chartGroup.selectAll("circle")
		.data(acsData)
		.enter()
		.append("circle")
		.attr("cx", d => XLinearScale(d[chosenXaxis]))
		.attr("cy", d => YLinearScale(d[chosenYaxis]))
		.attr("r", 12)
		.attr("stroke", "black")
		.attr("fill", "blue")
		.attr("opacity", "0.1")
		// .append("text")
		// .attr("dx", function(d){return -20})
		// .text(function (d) {return d.abbr});

	// Set the group for Xlabels
	var XlabelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${width / 2}, ${height + 20})`);

	var povertyLabel = XlabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 20)
		.attr("value", "poverty")
		.classed("active", true)
		.classed("x-text", true)
		.text("Poverty (%)");

	var ageLabel = XlabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 40)
		.attr("value", "age")
		.classed("inactive", true)
		.classed("x-text", true)
		.text("Age Median");

	var incomeLabel = XlabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 60)
		.attr("value", "income")
		.classed("inactive", true)
		.classed("x-text", true)
		.text("Income Median");

	// Set the group for YLabels
	var YlabelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${0}, ${height / 2})`)

	var healthcareLabel = YlabelsGroup.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", 0)
		.attr("y", -40)
		.attr("value", "healthcare")
		.classed("active", true)
		.classed("y-text", true)
		.text("Lack Healthcare (%)");

	var smokesLabel	= YlabelsGroup.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", 0)
		.attr("y", -60)
		.attr("value", "smokes")
		.classed("inactive", true)
		.classed("y-text", true)
		.text("Smokes (%)");

	var obesityLabel = YlabelsGroup.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", 0)
		.attr("y", -80)
		.attr("value", "obesity")
		.classed("inactive", true)
		.classed("y-text", true)
		.text("Obesity (%)");

	var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

	XlabelsGroup.selectAll(".x-text")
		.on("click", function() {
			var xValue = d3.select(this).attr("value");
			if (xValue != chosenXaxis) {

				// Replace chosenXaxis with value
				chosenXaxis = xValue;
				// redo functions on x-axis change

				XLinearScale = xScale(acsData, chosenXaxis);
				xAxis = renderXAxis(XLinearScale, xAxis);
				circlesGroup = renderCircles(circlesGroup, XLinearScale, YLinearScale, chosenXaxis, chosenYaxis);

				// debug updateToolTip
				console.log("tooltip paramaters");
				console.log(chosenXaxis, chosenYaxis, circlesGroup);
				circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

				if (chosenXaxis === "poverty") {
					povertyLabel
						.classed("active", true)
						.classed("inactive", false);
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", false)
						.classed("active", true);
				} else if (chosenXaxis === "age") {
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					ageLabel
						.classed("active", true)
						.classed("inactive", false);	
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);		
				} else {
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", true)
						.classed("inactive", false);	
				}
			}
		});

	YlabelsGroup.selectAll(".y-text")
		.on("click", function() {
			var yValue = d3.select(this).attr("value");
			if (yValue != chosenYaxis) {

				// Replace chosenXaxis with value
				chosenYaxis = yValue;

				// redo functions on x-axis change

				YLinearScale = yScale(acsData, chosenYaxis);
				yAxis = renderYAxis(YLinearScale, yAxis);
				circlesGroup = renderCircles(circlesGroup, XLinearScale, YLinearScale, chosenXaxis, chosenYaxis);

				// debug updateToolTip
				console.log("tooltip paramaters");
				console.log(chosenXaxis, chosenYaxis, circlesGroup);
				circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

				if (chosenYaxis === "obesity") {
					obesityLabel
						.classed("active", true)
						.classed("inactive", false);
					smokesLabel
						.classed("active", false)
						.classed("inactive", true);
					healthcareLabel
						.classed("active", false)
						.classed("inactive", true);
				} else if (chosenYaxis === "smokes") {
					obesityLabel
						.classed("active", false)
						.classed("inactive", true);
					smokesLabel
						.classed("active", true)
						.classed("inactive", false);
					healthcareLabel
						.classed("active", false)
						.classed("inactive", true);				
				} else {
					obesityLabel
						.classed("active", false)
						.classed("inactive", true);
					smokesLabel
						.classed("active", false)
						.classed("inactive", true);
					healthcareLabel
						.classed("active", true)
						.classed("inactive", false);
				}
			}
		});
});

