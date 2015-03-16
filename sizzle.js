      var w = $(window).width(), h = $(window).height();

      var labelDistance = 0;

      var vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h);

      var nodes = [];
      var edges = [];

      for(var i = 0; i < 30; i++) {
        var node = {
          label : "node " + i
        };
        nodes.push(node);
      };

      for(var i = 0; i < nodes.length; i++) {
        for(var j = 0; j < i; j++) {
          if(Math.random() > .95)
            edges.push({
              source : i,
              target : j,
              weight : Math.random()
            });
        }
      };

      var force = d3.layout.force().size([w, h]).nodes(nodes).links(edges).gravity(1).linkDistance(100).charge(-5000).linkStrength(function(x) {
        return x.weight * 10
      });

      force.start();

      var edge = vis.selectAll("line.edge").data(edges).enter().append("svg:line").attr("class", "edge");

      var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g");
      node.append("svg:ellipse").attr("rx", 45).attr("ry", 20).attr("class", "serviceNode");
      node.append("svg:text").text(function(d) {
        return d.label;
      }).attr("class", "serviceName");
      node.call(force.drag);

      var updateEdge = function() {
        this.attr("x1", function(d) {
          return d.source.x;
        }).attr("y1", function(d) {
          return d.source.y;
        }).attr("x2", function(d) {
          return d.target.x;
        }).attr("y2", function(d) {
          return d.target.y;
        });
      }

      var updateNode = function() {
        this.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      force.on("tick", function() {
        node.call(updateNode);
        edge.call(updateEdge);
      });