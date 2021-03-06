$(window).load(function () {
    
    $(document).ready(function () {
        
        var data1 = [
            {'x': 1, 'Revenue':150, 'Cost_to_Produce':-30, "Opportunity_Cost": -170}
        ];
        var data2 = [
            {'x': 1, 'Revenue':170, 'Cost_to_Produce':-30, "Opportunity_Cost": -140}
        ];
        
        //When the window resizes, resize the graph
        $( window ).resize(function() {
            graph1.resize();
            graph2.resize();
        });
        
        $('#change_graph').click(function(){
            graph1.update_data();
            graph2.update_data();
            if (graph1.current_data == 'accounting'){
                $(this).html('Click to switch to Economic Profit');
            }
            else if (graph1.current_data == 'economic'){
                $(this).html('Click to switch to Accounting Profit');
            }
        })
        
        //Init the graphs
        var graph1 = new profits_graph_class(data1, 'graph1');
        graph1.draw();
        var graph2 = new profits_graph_class(data2, 'graph2');
        graph2.draw();

    });
});

function profits_graph_class(the_data, graph_container_id){
    /*Class for the compare graph*/
    
    var self = this;
    self.margin = {};
    self.current_data = 'accounting';
    self.data = the_data;
    self.graph_container_id = graph_container_id

    self.update_data = function(){
        /*Switches the data from accounting to economic dataset or visa-versa*/
            
            //change to accounting profit
            if (self.current_data == 'economic') {
                self.current_data = 'accounting';
                
                //Make oppertunity cost zero
                self.bar_oppertunity_cost
                    .transition()
                    .attr("height", 0);
                
                //Sum Line
                self.calculate_sum();
                self.sum_line
                    .transition()
                    .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
                    .each('end',function(){
                        $('.oppertunity_cost').attr('visibility', 'hidden');    
                    });
                
                self.sum_line_text0
                    .transition()
                    .attr("y", self.yRange(self.sum)-5)
                    .text("$"+self.sum);
                
                self.sum_line_text1
                    .transition()
                    .attr("x", self.width )      
                    .attr("y", self.yRange(self.sum)+20)
                
                self.sum_line_text2
                    .transition()
                    .attr("x", self.width )             
                    .attr("y", self.yRange(self.sum)-5)
                    .text("Accounting");
                
            }
            
            //change to economic profit
            else if (self.current_data == 'accounting') {
                self.current_data = 'economic';
                $('.oppertunity_cost').attr('visibility', 'visible');
                //Make oppertunity cost zero
                self.bar_oppertunity_cost
                    .transition()
                    .attr("height", function(d) {
                        return Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0));
                    });
                
                //Sum Line
                self.calculate_sum();
                self.sum_line
                    .transition()
                    .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
                
                self.sum_line_text0
                    .transition()
                    .attr("y", self.yRange(self.sum)-5)
                    .text(self.currency_format(self.sum));
                
                self.sum_line_text1
                    .transition()
                    .attr("x", self.width )      
                    .attr("y", self.yRange(self.sum)+20)
                
                self.sum_line_text2
                    .transition()
                    .attr("x", self.width )             
                    .attr("y", self.yRange(self.sum)-5)
                    .text("Economic");
            }
    }
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        //Get the new graph dimensions
        self.set_graph_dimensions();
        
        //Update the svg dimensions
        self.svg
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom);
        self.svg_g
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
        
        //Rescale the range and axis functions to account for the new dimensions
         self.xRange
            .rangeRoundBands([0, self.width], .3)
        self.xAxis
            .scale(self.xRange);
        self.yRange
            .range([self.height, 0])
        
        //resize the x-axis
        self.x_axis
            .attr("transform", "translate(0," + self.yRange(0) + ")");
        self.x_axis.call(self.xAxis);
                
        
        //Add zero a_label
        self.zero_a_label      
            .attr("y", self.yRange(0)+20);
    
        //Revenue
        self.revenue_bar
            .attr("x", function(d) { return self.xRange(d.x); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) { return self.yRange( Math.max(0, d.Revenue)); })
            .attr("height", function(d) {
                return Math.abs(self.yRange(d.Revenue) - self.yRange(0));
                });
        
        self.revenue_text
            .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
            .attr("y", function(d) {
                return self.yRange(Math.max(0, d.Revenue)) + Math.abs(self.yRange(d.Revenue) - self.yRange(0))/2 + 5;
            });
        
        //cost to produce
        self.production_cost_bar
            .attr("x", function(d) { return self.xRange(d.x); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) { return self.yRange( Math.max(0, d.Cost_to_Produce)); })
            .attr("height", function(d) {
                return Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0));
                });
                
        self.production_cost_text
            .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
            .attr("y", function(d) {
                return self.yRange(Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0))/2 + 5;
            })
            
        //oppertunity cost
        self.bar_oppertunity_cost
            .attr("x", function(d) { return self.xRange(d.x); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) {
                return self.yRange( Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce)  - self.yRange(0));
            })
            .attr("height", function(d) {
                return Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0));
                });
                
         self.oppertunity_cost_text 
            .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
            .attr("y", function(d) {
                return self.yRange(Math.max(0, d.Opportunity_Cost)) + Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0))/2 + 5;
            });
        
        //Sum Line
        self.sum_line
            .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
        
        self.sum_line_text0          
            .attr("y", self.yRange(self.sum)-5)
        
        self.sum_line_text1
            .attr("x", self.width )      
            .attr("y", self.yRange(self.sum)+20)
        
        self.sum_line_text2
            .attr("x", self.width )             
            .attr("y", self.yRange(self.sum)-5)
    
    }//end resize
    
    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        //Get the graph dimensions
        self.set_graph_dimensions();
        
        //Get the sum
        self.calculate_sum();
        
        //Create Graph SVG
        self.svg = d3.select('#'+self.graph_container_id)
            .append("svg")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom);
        
        //Add a layer to the svg
        self.svg_g = self.svg.append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

                    
        self.xRange = d3.scale.ordinal()
            .rangeRoundBands([0, self.width], .3)
            .domain(self.data.map(function(d) {
                    return d.x;
                })
            );
          
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain(function(){
                    return [-200, 200];
            }());
        
         self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .orient("bottom")
            .tickFormat('');
        
        //add the x-axis
        self.x_axis = self.svg_g.append('svg:g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.yRange(0) + ")");
        self.x_axis.call(self.xAxis);
        
        //Add zero a_label
        self.zero_a_label = self.svg_g.append("text")
            .attr("x", 0 )             
            .attr("y", self.yRange(0)+20)
            .attr("text-anchor", "middle")
            .attr('class', 'zero a_label')
            .text("$0");
    
        //Revenue
        self.revenue_bar = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar revenue")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) { return self.yRange( Math.max(0, d.Revenue)); })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Revenue) - self.yRange(0));
                    });
        
        self.revenue_text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Revenue)) + Math.abs(self.yRange(d.Revenue) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "a_bar a_label")
                .text(function(d) {
                      return "Revenue " + self.currency_format(d.Revenue);
                });
        
        //cost to produce
        self.production_cost_bar = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar cost_to_produce")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) { return self.yRange( Math.max(0, d.Cost_to_Produce)); })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0));
                    });
                
        self.production_cost_text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "a_bar a_label")
                .text(function(d) {
                      return "Production Cost " + self.currency_format(d.Cost_to_Produce);
                });
                
            
        //oppertunity cost
        self.bar_oppertunity_cost = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar oppertunity_cost")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) {
                    return self.yRange( Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce)  - self.yRange(0));
                })
                .attr("height", 0);
                
         self.oppertunity_cost_text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Opportunity_Cost)) + Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "a_bar a_label")
                .text(function(d) {
                      return "Opportunity Cost " + self.currency_format(d.Opportunity_Cost);
                });
        $('.oppertunity_cost').attr('visibility', 'hidden');
        
        //Sum Line
        self.sum_line_function = d3.svg.line()
            .x(function(d, i) {
                return d.x
              })
            .y(function(d) { return self.yRange(d.y); });
        
        self.sum_line = self.svg_g.append("path")
            .attr("class", "sum_line")
            .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
        
        self.sum_line_text0 = self.svg_g.append("text")
            .attr("x", 20 )          
            .attr("y", self.yRange(self.sum)-5)
            .attr("text-anchor", "start")
            .attr('class', 'sum_line ')
            .text(self.currency_format(self.sum));
        
        self.sum_line_text1 = self.svg_g.append("text")
            .attr("x", self.width )      
            .attr("y", self.yRange(self.sum)+20)
            .attr("text-anchor", "end")
            .attr('class', 'sum_line ')
            .text("Profit");
        
        self.sum_line_text2 = self.svg_g.append("text")
            .attr("x", self.width )             
            .attr("y", self.yRange(self.sum)-5)
            .attr("text-anchor", "end")
            .attr('class', 'sum_line ')
            .text("Accounting");
            
    
    }//End draw graph
    
    /* Reusable functions********************/
    self.currency_format = function(value){
        /*Returns a currency formatted value for positive and negative values*/
        if (value >= 0){
            var formatted_value = "$" + value;
        }
        else{
            var formatted_value = "-$" + Math.abs(value);
        }
        return(formatted_value)
    }
        
    self.calculate_sum_line_data = function(){
        return [{"x":20, "y":self.sum}, {"x":self.width, "y":self.sum}];
    };
    
    self.calculate_sum = function(){
        /*Calculates the sum for the sum line*/
        if (self.current_data == "economic"){
            self.sum = self.data[0].Revenue + self.data[0].Cost_to_Produce + self.data[0].Opportunity_Cost;
        }
        else if (self.current_data == 'accounting'){
            self.sum = self.data[0].Revenue + self.data[0].Cost_to_Produce;
        }
    };
    
    self.set_graph_dimensions = function(){
        /*Resets the higheth width and margins based on the column width*/
        var graph_container_width = $('#'+self.graph_container_id).width();
        self.margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 10
        };
        self.width = graph_container_width - self.margin.right - self.margin.left;
        if (self.width > 350){
            self.width = 350;
        }
        self.height = 300- self.margin.top - self.margin.bottom;
    }
    
}