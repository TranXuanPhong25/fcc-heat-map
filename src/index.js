// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// import * as d3 from "d3"
'use strict';


const MONTHS_IN_YEAR = 12;
const CELL_WIDTH = 5;
const CELL_HEIGHT = 40;
const AXIS_Y_OFFSET = 10;
const TOOLTIP_PADDING = 20;
const commonCellClasses = "cell hover:stroke hover:stroke-black hover:cursor-pointer";
const formatTime = d3.timeFormat("%B");
const MONTHS_IN_TEXT =[ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_IN_NUMBER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const URL_DATA = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const padding = 60;
const tooltip = d3.select("#tooltip")

fetch(URL_DATA)
   .then(response => {
      if (!response.ok) {
         throw new Error("Network response was not ok");
      }
      return response.json();
   })
   .then(data => {
      const baseTemp = data.baseTemperature;
      data = data.monthlyVariance;
      console.log(data);
      //x-axis calculation
      const year = data.map(d => d.year);
      const minYear = parseInt( d3.min(year));
      const maxYear =   parseInt(d3.max(year));
      const WIDTH = (maxYear - minYear+1) * CELL_WIDTH;
      const HEIGHT = (MONTHS_IN_YEAR) * CELL_HEIGHT;
      
      const xScale = d3.scaleBand()
      .domain(year.filter(year=>year%10==0))
      .rangeRound([0, WIDTH]);
      

      const rectXScale = d3.scaleBand().domain(year).rangeRound([0, WIDTH]).padding(0);
      
      //y-axis calculation

      const monthsInYear = [];
      for (let i = 0; i < MONTHS_IN_YEAR; i++) {
         monthsInYear.push(new Date(0, i));
      }

      const yScale = d3.scaleBand()
         .domain(MONTHS_IN_TEXT)
         .range([HEIGHT, 0]);
         
      const rectYScale = d3.scaleBand().domain(MONTHS_IN_NUMBER).range([0, MONTHS_IN_YEAR * CELL_HEIGHT]);

      const svg = d3.select("svg").attr("width", WIDTH + padding * 2).attr("height", HEIGHT + padding*2);

      const axisX = svg.append("g")
         .call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")).tickSize(10,1))
         .attr("id", "x-axis")
         .attr("transform", `translate(${padding},${HEIGHT + AXIS_Y_OFFSET})`)

      const axisY = svg.append("g")
         .call(d3.axisLeft(yScale))
         .attr("id", "y-axis")
         .attr("transform", `translate(${padding},${AXIS_Y_OFFSET})`)

      const cells = svg.append("g").selectAll("rect")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", (d) => rectXScale(d.year) + padding)
         .attr("y", (d) => HEIGHT - rectYScale(d.month) + AXIS_Y_OFFSET-CELL_HEIGHT)
         .attr("class", commonCellClasses)
         .attr("data-month", (d, i) => d.month - 1)
         .attr("data-year", (d, i) => year[i])
         .attr("data-temp", (d, i) => baseTemp + d.variance)
         .attr("width", rectXScale.bandwidth())
         .attr("height",CELL_HEIGHT)
         .attr("fill", d => {
            const temp = baseTemp + d.variance;
            if (temp <= 2.8) {
               return "#313695";
            } else if (temp <= 3.9) {
               return "#4575b4";
            } else if (temp <= 5.0) {
               return "#74add1";
            } else if (temp <= 6.1) {
               return "#abd9e9";
            } else if (temp <= 7.2) {
               return "#e0f3f8";
            } else if (temp <= 8.3) {
               return "#ffffbf";
            } else if (temp <= 9.4) {
               return "#fee090";
            } else if (temp <= 10.5) {
               return "#fdae61";
            } else if (temp <= 11.6) {
               return "#f46d43";
            } else {
               return "#d73027";
            }
         })
         .on("mouseover", (e, d) => {
            d3.select(this).classed("hover", true);
            tooltip.style("opacity", 1)
               .attr("data-year", d["year"])
               .html(`
                  <p>${d["year"]} - ${formatTime(monthsInYear[d["month"] - 1])}</p>
                  <p>${(baseTemp + d["variance"]).toFixed(1)}°C</p>
                  <p>${d["variance"]}°C</p>

               `)

         })
         .on("mouseleave", () => {
            d3.select(this).classed("hover", false);
            tooltip.style("opacity", 0)
               .style("left", "-9999px");

         })
         .on("mousemove", (e, d) => {
            tooltip.style("left", e.clientX + TOOLTIP_PADDING + "px")
               .style("top", e.clientY + TOOLTIP_PADDING + "px")
            //stroke this cell
            
            //why this is not working?
            

         })
         
      const legend = svg.append("g").attr("id", "legend");
      const legendWidth = 300;
      const legendHeight = 20;
      const legendRectWidth = legendWidth / 8;
      const legendRectHeight = legendHeight;
      const legendRects = legend.selectAll("rect")
         .data([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.4, 10.5, 11.6])
         .enter()
         .append("rect")
         .attr("x", (_, i) => i * legendRectWidth + padding)
         .attr("y", HEIGHT + padding)
         .attr("width", legendRectWidth)
         .attr("height", legendRectHeight)
         .attr("stroke", "black")
         .attr("fill", d => {
            if (d <= 2.8) {
               return "#313695";
            } else if (d <= 3.9) {
               return "#4575b4";
            } else if (d <= 5.0) {
               return "#74add1";
            } else if (d <= 6.1) {
               return "#abd9e9";
            } else if (d <= 7.2) {
               return "#e0f3f8";
            } else if (d <= 8.3) {
               return "#ffffbf";
            } else if (d <= 9.4) {
               return "#fee090";
            } else if (d <= 10.5) {
               return "#fdae61";
            } else if (d <= 11.6) {
               return "#f46d43";
            } else {
               return "#d73027";
            }
         })


      const legendAxis = legend.append("g")
         .call(d3.axisBottom(d3.scaleLinear().domain([1.7, 13.8]).range([padding, legendWidth + padding+legendRectWidth*3]))
            .tickValues([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.4, 10.5, 11.6,12.7])
            .tickFormat(d3.format(".1f"))
            
         )
         .attr("transform", `translate(${-legendRectWidth}, ${legendRectHeight+HEIGHT+padding})`)
         .attr("id", "legend-axis")

   })
   .catch(error => console.error(error));
