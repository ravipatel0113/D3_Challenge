// @TODO: YOUR CODE HERE!
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
var ChosenXAxis = "poverty";
var ChosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label.
function xScale(ChosenXAxis, data, chartWidth){

    var xLinearScale = d3.scaleLinear()
        .domain([d3.max(data, d => d[ChosenXAxis])* 0.8,
            d3.max(data, d => d[ChosenXAxis]) * 1.1
    ]) 
    .range([0,chartWidth]);
    return xLinearScale;
}
// Function used for updating xAxis var upon click on axis label.
function renderXAxes(newXScale, xAxis){

    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
// Function used for updating y-scale var upon click on axis label.
function yScale(ChosenYAxis, data, chartHeight){

    var yLinearScale = d3.scaleLinear()
        .domain([d3.max(data, d => d[ChosenYAxis]) * 0.8,
            d3.max(data, d => d[ChosenYAxis]) * 1.1
        ])
        .range([chartHeight, 0 ]);
    return yLinearScale;
}
// Function used for updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis){

    var leftAxis = d3. axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Function used for updating circles group with a transition to new circles.
function renderCircles(circlesGroup, newXScale, newYScale, ChosenXAxis, ChosenYAxis){

    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[ChosenXAxis]))
        .attr('cy', d => newYScale(d[ChosenYAxis]));
    return circlesGroup;

}

// Function used for updating text in circles group with a transition to new text.
function renderText(circlestextGroup, newXScale, newYScale, ChosenXAxis, ChosenYAxis){

    circlestextGroup.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[ChosenXAxis]))
        .attr('y', d => newYScale(d[ChosenYAxis]));
    return circlestextGroup;
}

// Function used for updating circles group with new tooltip.
function updateToolTip(ChosenXAxis, ChosenYAxis, circlesGroup, textGroup){
    // Condition for X-Axis
    if (ChosenXAxis === 'poverty'){
        var xlabel = 'Poverty: ';
    }
    else if (ChosenXAxis == 'income'){
        var xlabel = 'Median Income: ';
    }
    else {
        var xlabel = 'Age: ';
    }

    //Condition for Y-Axis
    if(ChosenYAxis === 'healthcare'){
        var ylabel = 'Lacks Healthcare: ';
    }
    else if (ChosenYAxis === 'smokes'){
        var ylabel = 'Smokers: ';
    }
    else {
        var ylabel = 'Obesity: ';
    }

    // Define toolTip:

    // Define tooltip.
    var toolTip = d3.tip()
        .offset([-20, 0])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (ChosenXAxis === "age") 
                {
                // All yAxis tooltip labels presented and formated as %.
                // Display Age without format for xAxis.
                return (`${d.state}<br>${xlabel} ${d[ChosenXAxis]}<br>${ylabel}${d[ChosenYAxis]}%`);
                } 
            else if (ChosenXAxis !== "poverty" && ChosenXAxis !== "age") 
                {
                // Display Income in dollars for xAxis.
                return (`${d.state}<br>${xlabel}$${d[ChosenXAxis]}<br>${ylabel}${d[ChosenYAxis]}%`);
                } 
            else 
                {
                // Display Poverty as percentage for xAxis.
                return (`${d.state}<br>${xlabel}${d[ChosenXAxis]}%<br>${ylabel}${d[ChosenYAxis]}%`);
                }      
        });
    circlesGroup.call(toolTip);

    // Create "mouseover" event listener to display tool tip.

    circlesGroup
    .on('mouseover', function(data){
        toolTip.show(data, this);
        d3.select(this)
        .transition()
        .duration(1000)
        .attr('r',20);
    })
    .on('mouseout', function(data){
        toolTip.hide(data);
        d3.select(this)
        .transition()
        .duration(1000)
        .attr('r', 15);

    });

    textGroup
    .on('mouseover', function(data){
        toolTip.show(data, this);
    })
    .on('mouseout', function(data){
        toolTip.hide(data);
    });

    return circlesGroup;

}
var activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
activeCard.style('display', 'block');

function makeResponsive(){
    var svg  = d3 
    .select("#scatter")
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

    var chartGroup  = svg.append('g')
        .attr('transform', `translate (${margin.left}, ${margin.top})`);
    
    
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
            var xLinearScale = xScale(censusData, ChosenXAxis, chartWidth);
            var yLinearScale = yScale(censusData, ChosenYAxis, chartHeight);
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
            // var elemEnter = circlesGroup
            //     .enter();
            var circle = circlesGroup.enter()
                .append("circle")
                .attr("cx", d => xLinearScale(d[ChosenXAxis]))
                .attr("cy", d => yLinearScale(d[ChosenYAxis]))
                .attr("r", 15)
                .classed("stateCircle", true);
            // Create circle text.
            var circleText = circlesGroup.enter()
                .append("text")            
                .attr("x", d => xLinearScale(d[ChosenXAxis]))
                .attr("y", d => yLinearScale(d[ChosenYAxis]))
                .attr("dy", ".35em") 
                .text(d => d.abbr)
                .classed("stateText", true);

        var circlesGroup = updateToolTip(ChosenXAxis, ChosenYAxis, circle, circleText);
        
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
                ChosenXAxis = d3.select(this).attr("value");
                // Update xLinearScale.
                xLinearScale = xScale(censusData, ChosenXAxis, chartWidth);
                // Render xAxis.
                xAxis = renderXAxes(xLinearScale, xAxis);
                // Switch active/inactive labels.
                if (ChosenXAxis === "poverty") {
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
                    activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
                    activeCard.style("display", "block");
                } else if (ChosenXAxis === "age") {
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
                    activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
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
                    activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
                    activeCard.style("display", "block");
                }
                // Update circles with new x values.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, ChosenXAxis, ChosenYAxis);
                // Update tool tips with new info.
                circlesGroup = updateToolTip(ChosenXAxis, ChosenYAxis, circle, circleText);
                // Update circles text with new values.
                circleText = renderText(circleText, xLinearScale, yLinearScale, ChosenXAxis, ChosenYAxis);
            });
        // Y Labels event listener.
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                ChosenYAxis = d3.select(this).attr("value");
                // Update yLinearScale.
                yLinearScale = yScale(censusData, ChosenYAxis, chartHeight);
                // Update yAxis.
                yAxis = renderYAxes(yLinearScale, yAxis);
                // Changes classes to change bold text.
                if (ChosenYAxis === "healthcare") {
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
                    activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
                    activeCard.style("display", "block");
                } else if (ChosenYAxis === "smokes"){
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
                    activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
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
                    activeCard = d3.select(`#${ChosenXAxis}-${ChosenYAxis}`);
                    activeCard.style("display", "block");
                }
                // Update circles with new y values.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, ChosenXAxis, ChosenYAxis);
                // Update circles text with new values.
                circleText = renderText(circleText, xLinearScale, yLinearScale, ChosenXAxis, ChosenYAxis);
                // Update tool tips with new info.
                circlesGroup = updateToolTip(ChosenXAxis, ChosenYAxis, circle, circleText);
            });

    }).catch(function(err){
        console.log(err);
    });
}
makeResponsive();