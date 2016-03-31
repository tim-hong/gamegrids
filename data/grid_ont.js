 /*	
  	Requires these in <body>
  	<d3content>
  	</d3content>
  	<legend>
  	</legend>
  */
 //Get the archetypes for a given game
 //Creates the two svgs (the grid and the legend)
 //for a given game id
 //Each page should call this function in a script block
 function gridgame(id) {
     d3.csv("./data/ont_game.csv", function(d) {
         return {
             gid: +d.gid, // convert "Year" column to Date
             aid: +d.aid,
             data: +d.data,
         };
     }, function(error, game) {
         d3.csv("./data/ont_aa.csv", function(d) {
             return {
                 gid: +d.gid, // convert "Year" column to Date
                 aid: +d.aid,
                 data: +d.data,
             };
         }, function(error2, aa) {

             // Gets all the entries matching the associated game
             // Requires out_game_100.json

             function gidfilter(id) {
                 ret = []
                 for (i = 0; i < game.length; i++) {
                     if (game[i].gid == id)
                         ret.push(game[i])
                 }
                 return ret
             }

             // Gets all the entries matching the associated archetype
             // Requires out_aa_100.json
             function aidfilter(id) {
                 ret = []
                 for (i = 0; i < aa.length; i++) {
                     if (aa[i].aid == id)
                         ret.push(aa[i])
                 }
                 return ret
             }

             //Takes in the result of aid or gid filter
             //and makes two lists, one with the non-zero entries
             //which is "games" and the other with zero entries
             //being "other"
             function notempty(list) {
                 ret = []
                 other = []
                 for (i = 0; i < list.length; i++) {
                     if (list[i].data != 0)
                         ret.push(list[i])
                     else
                         other.push(list[i])
                 }
                 return {
                     "games": ret,
                     "other": other
                 }
             }




             //Returns a hex code given a seed i
             //16777215 is FFFFFF
             function randcolor(i) {
                 color = Math.floor((Math.abs(Math.sin(i) * 16777215)) % 16777215).toString(16);
                 return '#' + color;
             }

             //Get game title from the id
             //Requires titles.json
             function getgtitle(id) {
                 ret = ""
                 for (i = 0; i < titles.length; i++) {
                     if (titles[i].gid == id)
                         ret = titles[i].title + " (" + titles[i].year + ")"
                 }
                 return ret
             }

             var svg = d3.select("d3content")
                 .append("svg")
                 .attr("width", 300)
                 .attr("height", 300);

             //get the entries of a game given the id
             var gridgames = gidfilter(id)
             var ngames = notempty(gridgames)

             //Array to hold data entries of each 100 squares in the grid
             gridz = []
             for (i = 0; i < 100; i++) {
                 gridz.push({
                     "gid": -1,
                     "aid": -1,
                     "data": 0
                 });
             }

             //go through and populate gridz based on the 
             //%data entries of the non-zero entries for games
             index = 0;
             for (i = 0; i < ngames.games.length; i++) {
                 for (j = index; j < index + ngames.games[i].data; j++) {
                     gridz[j] = ngames.games[i]
                 }
                 index = index + ngames.games[i].data
             }

             for (i = 1; i < 10; i += 2) {
                 for (j = 9; j > 4; j--) {
                     var c = gridz[i * 10 + j]
                     gridz[i * 10 + j] = gridz[i * 10 + (9 - j)]
                     gridz[i * 10 + (9 - j)] = c
                 }
             }

             //create the squares
             var squares = svg.selectAll("rect")
                 .data(gridz)
                 .enter()
                 .append("rect");

             //dim is the pixel size of a square
             var dim = 20;

             //make a tooltip for hover over
             tip = d3.tip().attr('class', 'd3-tip')
                 .html(function(d) {
                     if (d.gid == -1) {
                         return "Other"
                     } else
                         return d.aid;
                 });
             svg.call(tip)

             //draw the squares on the grid
             //TODO: remove click events for gid = -1
			 var prev = gridz[0].aid
			 var spacer = 0
             squares.attr("x", function(d, i) {
			         //if(d.aid != prev) spacer++
                     return ((i % 10) + 1) * (dim+spacer);
                 })
                 .attr("y", function(d, i) {
                     return (parseInt(i / 10) + 1) * (dim+spacer);
					 
                 })
                 .attr("width", dim)
                 .attr("height", dim)
                 .attr("fill", function(d) {
                     return randcolor(d.aid)
                 })
                 .on('mouseover', tip.show)
                 .on('mouseout', tip.hide)
                 .on('click', function(d, i) {
                     if (d.gid == -1) {
                         return
                     } else {
                         d3.selectAll("svg").remove();
                         d3.selectAll("div").remove();
                         //d3.selectAll("g").remove();
                         gridaa(d.aid)
                     }
                 });

             //make legend
             //TODO: Add links to "other" to get out of loops
             //      to do this, iterate over ngames.other
             //      
             var leg = d3.select("legend")
                 .append("svg")
                 .attr("width", 300)
                 .attr("height", 1100);

             var inorder = ngames.games.concat(ngames.other)
             var lego = leg.selectAll("g")
                 .data(inorder)
                 .enter()
                 .append("g");

             lego.append("rect")
                 .attr("x", 0)
                 .attr("y", function(d, i) {
                     return (i + 1) * (dim + 1)
                 })
                 .attr("width", dim)
                 .attr("height", dim)
                 .attr("fill", function(d) {
                     if (d.data == 0)
                         return randcolor(-1)
                     else
                         return randcolor(d.aid);
                 });

             lego.append("text")
                 .attr("x", dim + 5)
                 .attr("y", function(d, i) {
                     return (i + 1) * (dim + 1)
                 })
                 .attr("dy", "1em")
                 .text(function(d) {
                     return d.aid;
                 })
                 .on('click', function(d, i) {
                     if (d.gid == -1) {
                         return
                     } else {
                         d3.selectAll("svg").remove();
                         d3.selectAll("div").remove();
                         //d3.selectAll("g").remove();
                         gridaa(d.aid)
                     }
                 });
         });
     });
     //create the initial svg

 }

 function gridaa(id) {
     d3.csv("./data/ont_game.csv", function(d) {
         return {
             gid: +d.gid, // convert "Year" column to Date
             aid: +d.aid,
             data: +d.data,
         };
     }, function(error, game) {
         d3.csv("./data/ont_aa.csv", function(d) {
             return {
                 gid: +d.gid, // convert "Year" column to Date
                 aid: +d.aid,
                 data: +d.data,
             };
         }, function(error2, aa) {
             // Requires out_game_100.json

             function gidfilter(id) {
                 ret = []
                 for (i = 0; i < game.length; i++) {
                     if (game[i].gid == id)
                         ret.push(game[i])
                 }
                 return ret
             }

             // Gets all the entries matching the associated archetype
             // Requires out_aa_100.json
             function aidfilter(id) {
                 ret = []
                 for (i = 0; i < aa.length; i++) {
                     if (aa[i].aid == id)
                         ret.push(aa[i])
                 }
                 return ret
             }

             //Takes in the result of aid or gid filter
             //and makes two lists, one with the non-zero entries
             //which is "games" and the other with zero entries
             //being "other"
             function notempty(list) {
                 ret = []
                 other = []
                 for (i = 0; i < list.length; i++) {
                     if (list[i].data != 0)
                         ret.push(list[i])
                     else
                         other.push(list[i])
                 }
                 return {
                     "games": ret,
                     "other": other
                 }
             }




             //Returns a hex code given a seed i
             //16777215 is FFFFFF
             function randcolor(i) {
                 color = Math.floor((Math.abs(Math.sin(i) * 16777215)) % 16777215).toString(16);
                 return '#' + color;
             }

             //Get game title from the id
             //Requires titles.json
             function getgtitle(id) {
                 ret = ""
                 for (i = 0; i < titles.length; i++) {
                     if (titles[i].gid == id)
                         ret = titles[i].title + " (" + titles[i].year + ")"
                 }
                 return ret
             }


             var svg = d3.select("d3content")
                 .append("svg")
                 .attr("width", 300)
                 .attr("height", 300);
             var gridgames = aidfilter(id)
             var ngames = notempty(gridgames)

             gridz = []
             for (i = 0; i < 100; i++) {
                 gridz.push({
                     "gid": -1,
                     "aid": -1,
                     "data": 0
                 });
             }

             index = 0;
             for (i = 0; i < ngames.games.length; i++) {
                 for (j = index; j < index + ngames.games[i].data; j++) {
                     gridz[j] = ngames.games[i]
                 }
                 index = index + ngames.games[i].data
             }

             for (i = 1; i < 10; i += 2) {
                 for (j = 9; j > 4; j--) {
                     var c = gridz[i * 10 + j]
                     gridz[i * 10 + j] = gridz[i * 10 + (9 - j)]
                     gridz[i * 10 + (9 - j)] = c
                 }
             }

             var squares = svg.selectAll("rect")
                 .data(gridz)
                 .enter()
                 .append("rect");

             var dim = 20;
             tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
                 return getgtitle(d.gid)
             });
             svg.call(tip)
			 
			 var prev = gridz[0].gid
			 var spacer = 0
             squares.attr("x", function(d, i) {
			         //if(d.aid != prev) spacer++
                     return ((i % 10) + 1) * (dim+spacer);
                 })
                 .attr("y", function(d, i) {
                     return (parseInt(i / 10) + 1) * (dim+spacer);
					 prev = d.gid
                 })
                 .attr("width", dim)
                 .attr("height", dim)
                 .attr("fill", function(d) {
                     return randcolor(d.gid)
                 })
                 .on('mouseover', tip.show)
                 .on('mouseout', tip.hide)
                 .on('click', function(d, i) {
                     if (d.gid == -1) {
                         return
                     }
                     d3.selectAll("svg").remove();
                     d3.selectAll("div").remove();
                     //d3.selectAll("g").remove();
                     gridgame(d.gid)
                 });


             //make legend			
             var leg = d3.select("legend")
                 .append("svg")
                 .attr("width", 600)
                 .attr("height", 1100);

             var inorder = ngames.games.concat(ngames.other)

             var lego = leg.selectAll("g")
                 .data(inorder)
                 .enter()
                 .append("g");


             lego.append("rect")
                 .attr("x", 0)
                 .attr("y", function(d, i) {
                     return (i + 1) * (dim + 1)
                 })
                 .attr("width", dim)
                 .attr("height", dim)
                 .attr("fill", function(d) {
                     if (d.data == 0)
                         return randcolor(-1)
                     return randcolor(d.gid);
                 });

             lego.append("text")
                 .attr("x", dim + 5)
                 .attr("y", function(d, i) {
                     return (i + 1) * (dim + 1)
                 })
                 .attr("dy", "1em")
                 .text(function(d) {
                     return getgtitle(d.gid);
                 })
                 .on('click', function(d, i) {
                     d3.selectAll("svg").remove();
                     d3.selectAll("div").remove();
                     //d3.selectAll("g").remove();
                     gridgame(d.gid)
                 });
         });
     }); // Gets all the entries matching the associated game

 }