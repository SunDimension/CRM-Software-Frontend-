<template>
  <div>
    <div class="row match-height">
      <!-- Loop through data and render charts -->
      <div v-for="(item, i) in data.data" :key="i" :class="`col-lg-${item.column_width} col-12`">
        <div class="card text-capitalize">
          <div class="card-header">
            <h4 class="card-title mb-0">
              <strong class="text-primary">Title:</strong> {{ item.chart_title }}
            </h4>
          </div>
          <div class="card-body text-center pointer">
            <!-- Chart display logic -->
            <DxChart
              v-if="item.chart_category === 'Bar'"
              :id="'chart' + i"
              :dataSource="item.data"
              :rotated="true"
              :barGroupPadding="0.2"
              style="height: 300px"
            >
              <DxoAnimation :enabled="false" />
              <DxoSeriesTemplate nameField="name" />
              <DxoCommonSeriesSettings
                argumentField="name"
                valueField="total"
                :type="item.chart_type"
              />
            </DxChart>

            <DxPieChart
              v-if="item.chart_category === 'Pie'"
              :id="'pie' + i"
              style="height: 300px"
              :dataSource="item.data"
              resolveLabelOverlapping="shift"
            >
              <DxiSeries argumentField="name" valueField="total">
                <DxoLabel :visible="true" :customizeText="customizeLabel">
                  <DxoConnector :visible="true" />
                </DxoLabel>
              </DxiSeries>
              <DxoTooltip :enabled="true" :customizeTooltip="customizeTooltip" />
            </DxPieChart>
          </div>
        </div>
      </div>
    </div>

    <DxPopup
      v-model:visible="popupVisible"
      :showTitle="true"
      :title="obj.title"
      :closeOnOutsideClick="true"
      :showCloseButton="true"
    >
      <template #content>
        <DxScrollView width="100%" height="100%">
          <div class="text-right p-1">
            <button @click="exportGrid(2)" type="button" class="btn btn-dark mr-1">
              <span data-feather="printer" class="mr-25"></span>Print
            </button>
            <button @click="exportGrid(1)" type="button" class="btn btn-outline-dark">
              <span data-feather="file-text" class="mr-25"></span>Export to PDF
            </button>
          </div>
          <DxDataGrid
            ref="dataGrid"
            :dataSource="data.table_data"
            :showBorders="true"
            placeholder="Search..."
            :showColumnLines="true"
            :showRowLines="true"
            :rowAlternationEnabled="true"
            keyExpr="id"
          >
            <DxiColumn dataField="reference_no" caption="Ref No." />
            <DxiColumn dataField="contract_title" caption="Contractor Name" />
            <DxiColumn
              dataField="date_awarded"
              dataType="date"
              format="MMM d, yyyy"
              caption="Award Date"
            />
            <DxiColumn dataField="contract_sum" format="#,###.00" caption="Contract Sum (NGN)" />
          </DxDataGrid>
        </DxScrollView>
      </template>
    </DxPopup>
  </div>
</template>

<script>
import {
  DxChart,
  DxPieChart,
  DxPopup,
  DxScrollView,
  DxDataGrid,
  DxiSeries,
  DxiColumn,
  DxoAnimation,
  DxoSeriesTemplate,
  DxoCommonSeriesSettings,
  DxoLabel,
  DxoConnector,
  DxoTooltip,
} from "devextreme-vue";

export default {
  components: {
    DxChart,
    DxPieChart,
    DxPopup,
    DxScrollView,
    DxDataGrid,
    DxiSeries,
    DxiColumn,
    DxoAnimation,
    DxoSeriesTemplate,
    DxoCommonSeriesSettings,
    DxoLabel,
    DxoConnector,
    DxoTooltip,
  },
  data() {
    return {
      data: {
        data: [], // Replace with your actual data
        table_data: [], // Replace with your actual table data
      },
      popupVisible: false,
      obj: {
        filter: "",
        value: "",
        is_group: "",
        title: null,
      },
    };
  },
  methods: {
    customizeLabel(point) {
      const percentPipe = new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${point.argumentText}: ${percentPipe.format(point.percent)}`;
    },
    customizeTooltip(arg) {
      const percentPipe = new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return {
        text: `${arg.valueText} - ${percentPipe.format(arg.percent)}`,
      };
    },
    formatData(data) {
      data.forEach((element) => {
        if (element.chart_type === "rangeBar") {
          element.data.forEach((item) => {
            item.start = new Date(item.start);
            item.end = new Date(item.end);
          });
        }
      });
      this.data = data;
    },
    openDialog(event, filterColumn, is_group, reportTitle) {
      const e = event;
      const value = is_group
        ? `${e.target.data.name};${e.target.data.name2}`
        : e.target.originalArgument;
      const title = is_group
        ? `${reportTitle} : ${e.target.data.name} and ${e.target.data.name2}`
        : `${reportTitle} : ${e.target.originalArgument}`;
      this.obj = { filter: filterColumn, value, is_group, title };
      this.popupVisible = true;
    },
    exportGrid(type) {
      const instance = this.$refs.dataGrid.instance;
      // Implement PDF export logic
    },
  },
};
</script>

<style scoped>
/* Add custom styles here */
</style>
