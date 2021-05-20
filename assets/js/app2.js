// @TODO: YOUR CODE HERE!
// Select div by id.
var svgArea = d3.select("#scatter").select("svg");
// Clear SVG.
if (!svgArea.empty()) {
    svgArea.remove();
}
//SVG params.
var svgHeight = window.innerHeight/1.5;
var svgWidth = window.innerWidth/1.1;
// Margins.
var margin = {
    top: 50,
    right: 110,
    bottom: 120,
    left: 150
};
// Chart area minus margins.
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;
// Set default x/y axis variables.
var xCol = "poverty";
var yCol = "healthcare";
// Function used for updating x-scale var upon click on axis label.
function xScale(data, xCol, chartWidth) {
    // Create scales.
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[xCol]) * .8,
            d3.max(data, d => d[xCol]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}
// Function used for updating xAxis var upon click on axis label.
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
// Function used for updating y-scale var upon click on axis label.
function yScale(data, yCol, chartHeight) {
    // Create scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[yCol]) * .8,
            d3.max(data, d => d[yCol]) * 1.1])
        .range([chartHeight, 0]);
    return yLinearScale;
}
// Function used for updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
// Function used for updating circles group with a transition to new circles.
function renderCircles(circlesGroup, newXScale, newYScale, xCol, yCol) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[xCol]))
        .attr("cy", d => newYScale(d[yCol]));
    return circlesGroup;
}
// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, xCol, yCol) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[xCol]))
        .attr("y", d => newYScale(d[yCol]));
    return circletextGroup;
}
// Function used for updating circles group with new tooltip.
function updateToolTip(xCol, yCol, circlesGroup, textGroup) {
    // Conditional for X Axis.
    if (xCol === "poverty") {
        var xlabel = "Poverty: ";
    } else if (xCol === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }
    // Conditional for Y Axis.
    if (yCol === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (yCol === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // Define tooltip.
    var toolTip = d3.tip()
        .offset([-20, 0])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (xCol === "age") {
                // All yAxis tooltip labels presented and formated as %.
                // Display Age without format for xAxis.
                return (`${d.state}<br>${xlabel} ${d[xCol]}<br>${ylabel}${d[yCol]}%`);
                } else if (xCol !== "poverty" && xCol !== "age") {
                // Display Income in dollars for xAxis.
                return (`${d.state}<br>${xlabel}$${d[xCol]}<br>${ylabel}${d[yCol]}%`);
                } else {
                // Display Poverty as percentage for xAxis.
                return (`${d.state}<br>${xlabel}${d[xCol]}%<br>${ylabel}${d[yCol]}%`);
                }      
        });
    circlesGroup.call(toolTip);
    // Create "mouseover" event listener to display tool tip.
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
            d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", 20);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
            d3.select(this)
            .transition()
            .duration(1000)
            .attr("r", 15);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}
    var activeCard = d3.select(`#${xCol}-${yCol}`);
    activeCard.style("display", "block");
function makeResponsive() {
    
    
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    d3.csv("assets/data/data.csv").then(function(censusData, err) {
        if (err) throw err;
        // Parse data.
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });
        // Create x/y linear scales.
        var xLinearScale = xScale(censusData, xCol, chartWidth);
        var yLinearScale = yScale(censusData, yCol, chartHeight);
        // Create initial axis functions.
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
        // Append x axis.
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        // Append y axis.
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        // Set data used for circles.
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData);
        // Bind data.
        var elemEnter = circlesGroup.enter();
        // Create circles.
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[xCol]))
            .attr("cy", d => yLinearScale(d[yCol]))
            .attr("r", 15)
            .classed("stateCircle", true);
        // Create circle text.
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[xCol]))
            .attr("y", d => yLinearScale(d[yCol]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);
        // Update tool tip function above csv import.
        var circlesGroup = updateToolTip(xCol, yCol, circle, circleText);
        // Add x label groups and labels.
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");
        // Add y labels group and labels.
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 100 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 80 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 60 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");
        // X labels event listener.
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                xCol = d3.select(this).attr("value");
                // Update xLinearScale.
                xLinearScale = xScale(censusData, xCol, chartWidth);
                // Render xAxis.
                xAxis = renderXAxes(xLinearScale, xAxis);
                // Switch active/inactive labels.
                if (xCol === "poverty") {
                    activeCard.style("display", "none");
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    activeCard = d3.select(`#${xCol}-${yCol}`);
                    activeCard.style("display", "block");
                } else if (xCol === "age") {
                    activeCard.style("display", "none");
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    activeCard = d3.select(`#${xCol}-${yCol}`);
                    activeCard.style("display", "block");
                } else {
                    activeCard.style("display", "none");
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    activeCard = d3.select(`#${xCol}-${yCol}`);
                    activeCard.style("display", "block");
                }
                // Update circles with new x values.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, xCol, yCol);
                // Update tool tips with new info.
                circlesGroup = updateToolTip(xCol, yCol, circle, circleText);
                // Update circles text with new values.
                circleText = renderText(circleText, xLinearScale, yLinearScale, xCol, yCol);
            });
        // Y Labels event listener.
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                yCol = d3.select(this).attr("value");
                // Update yLinearScale.
                yLinearScale = yScale(censusData, yCol, chartHeight);
                // Update yAxis.
                yAxis = renderYAxes(yLinearScale, yAxis);
                // Changes classes to change bold text.
                if (yCol === "healthcare") {
                    activeCard.style("display", "none");
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    activeCard = d3.select(`#${xCol}-${yCol}`);
                    activeCard.style("display", "block");
                } else if (yCol === "smokes"){
                    activeCard.style("display", "none");
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    activeCard = d3.select(`#${xCol}-${yCol}`);
                    activeCard.style("display", "block");
                } else {
                    activeCard.style("display", "none");
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    activeCard = d3.select(`#${xCol}-${yCol}`);
                    activeCard.style("display", "block");
                }
                // Update circles with new y values.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, xCol, yCol);
                // Update circles text with new values.
                circleText = renderText(circleText, xLinearScale, yLinearScale, xCol, yCol);
                // Update tool tips with new info.
                circlesGroup = updateToolTip(xCol, yCol, circle, circleText);
            });
    }).catch(function(err) {
        console.log(err);
    });
}
makeResponsive();
// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);