/*
** Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded File Storage System Javascript');

const file_storage_system_query_cb = "file-storage-system-query-cb";

/*
** Define File Storage System Class
 */
class FileStorageSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.file_storage_systems.length + 1);
        this.compartment_id = '';
        this.subnet_id = data.parent_id;
        this.availability_domain = '1';
        this.source = this.getOkitJson().getSubnet(this.subnet_id)['cidr_block'];
        this.hostname_label = this.display_name.toLowerCase();
        this.path = '/mnt';
        this.access = 'READ_ONLY';
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new FileStorageSystem(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());
        /*
        ** Add Properties Load Event to created svg. We require the definition of the local variable "me" so that it can
        ** be used in the function dur to the fact that using "this" in the function will refer to the function not the
        ** Artifact.
         */
        let me = this;
        svg.on("click", function() {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        console.groupEnd();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/file_storage_system.html", () => {loadPropertiesSheet(me);});
    }


    /*
    ** Child Offset Functions
     */
    getFirstChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getContainerChildOffset() {
        let offset = this.getFirstContainerChildOffset();
        return offset;
    }

    getTopEdgeChildOffset() {
        let offset = this.getFirstTopEdgeChildOffset();
        return offset;
    }

    getBottomEdgeChildOffset() {}

    getLeftEdgeChildOffset() {}

    getRightEdgeChildOffset() {}

    getTopChildOffset() {
        let offset = this.getTopEdgeChildOffset();
        return offset;
    }

    getBottomChildOffset() {}

    getLeftChildOffset() {}

    getRightChildOffset() {}


    getNamePrefix() {
        return super.getNamePrefix() + 'fss';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'File Storage System';
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- queryFileStorageSystemAjax --------------------');
        console.info('------------- Compartment : ' + request.compartment_id);
        console.info('------------- Subnet      : ' + request.subnet_id);
        let me = this;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/FileStorageSystem',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({file_storage_systems: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + file_storage_system_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + file_storage_system_query_cb).prop('checked', true);
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', file_storage_system_query_cb);
    cell.append('label').text(FileStorageSystem.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(FileStorageSystem.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'file_storage_system_name_filter')
        .attr('name', 'file_storage_system_name_filter');
});
