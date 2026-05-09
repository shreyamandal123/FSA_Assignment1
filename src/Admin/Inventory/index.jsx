import React from "react";
import Header from "../Header";
import MUIDataTable from "mui-datatables";
import { IconButton, Button, Grid, Select, MenuItem, Typography } from "@material-ui/core";
import { blue, green } from "@material-ui/core/colors";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import EditProduct from "./EditProduct";
import AddProduct from "./AddProduct";
import { Add, Edit } from "@material-ui/icons";
import axios from "axios";
import { connect } from "react-redux";

class Inventory extends React.Component {
  state = {
    dataIndex: null,
    isEditClicked: false,
    isAddClicked: false,
    userId: null,
    stores: [],
    selectedStoreId: "",
    processData: [],
  };

  componentDidMount() {
    const adminId = this.props.auth.user.id;
    this.setState({ userId: adminId });

    axios.get(`http://localhost:5000/api/stores/getStores/${adminId}`).then((res) => {
      const stores = res.data || [];
      const selectedStoreId = stores.length > 0 ? stores[0]._id : "";
      this.setState({ stores, selectedStoreId }, this.fetchProducts);
    });
  }

  fetchProducts = () => {
    const { userId, selectedStoreId } = this.state;
    if (!userId || !selectedStoreId) {
      this.setState({ processData: [] });
      return;
    }

    axios
      .get(`http://localhost:5000/api/products/getStoreItem/${userId}?storeId=${selectedStoreId}`)
      .then((res) => {
        const pdata = res.data || [];
        const processData = pdata.map((data, key) => [key + 1, data.productName, data.category, data.price, data.quantity, data._id]);
        this.setState({ processData });
      });
  };

  getMuiTheme = () =>
    createMuiTheme({
      overrides: {
        MuiTableRow: { root: { "&$selected": { backgroundColor: "#e6f0ff !important" } } },
        MUIDataTableSelectCell: { checked: { color: "dodgerblue !important" } },
      },
    });

  handleEditClick = (dataIndex) => {
    this.setState({ dataIndex, isEditClicked: !this.state.isEditClicked });
  };

  handleAddClick = (refresh) => {
    this.setState({ isAddClicked: !this.state.isAddClicked }, () => {
      if (refresh) this.fetchProducts();
    });
  };

  render() {
    const columns = [
      { name: "productKey", label: "Product ID" },
      { name: "productName", label: "Product Name" },
      { name: "productCategory", label: "Product Category" },
      { name: "productPrice", label: "Product Price($)" },
      { name: "productQuantity", label: "Product Quantity" },
      {
        name: "editProduct",
        label: "Edit Product",
        options: {
          customBodyRenderLite: (dataIndex) => (
            <IconButton onClick={() => this.handleEditClick(dataIndex)}>
              <Edit style={{ color: blue[500] }} />
            </IconButton>
          ),
        },
      },
    ];

    const options = {
      filterType: "checkbox",
      onRowsDelete: (rowsDeleted) => {
        const data = this.state.processData;
        const idsToDelete = rowsDeleted.data.map((d) => data[d.dataIndex][5]);
        Promise.all(
          idsToDelete.map((id) => axios.delete(`http://localhost:5000/api/products/deleteItem/${id}`))
        ).then(() => this.fetchProducts());
      },
    };

    if (this.state.isAddClicked) {
      return <AddProduct handleAddClick={this.handleAddClick} userId={this.state.userId} storeId={this.state.selectedStoreId} />;
    }

    if (this.state.isEditClicked) {
      return <EditProduct handleEditClick={this.handleEditClick} data={this.state.processData[this.state.dataIndex]} />;
    }

    return (
      <div>
        <Header />
        <div style={{ margin: "2rem" }}>
          <Grid container justify="center" style={{ marginBottom: "1rem" }}>
            <Grid item xs={8}>
              <Typography variant="subtitle1">Shop</Typography>
              <Select
                fullWidth
                variant="outlined"
                value={this.state.selectedStoreId}
                onChange={(e) => this.setState({ selectedStoreId: e.target.value }, this.fetchProducts)}
              >
                {this.state.stores.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.storeName} ({s.city})
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          <Grid container justify="center">
            <Grid item xs={8}>
              <MuiThemeProvider theme={this.getMuiTheme()}>
                <MUIDataTable title={"Inventory"} data={this.state.processData} columns={columns} options={options} />
              </MuiThemeProvider>
            </Grid>
          </Grid>
          <br />
          <Grid justify="center" container>
            <Button
              variant="outlined"
              size="large"
              style={{ color: green[500] }}
              startIcon={<Add />}
              onClick={this.handleAddClick}
              disabled={!this.state.selectedStoreId}
            >
              Add Product
            </Button>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ auth: state.auth });

export default connect(mapStateToProps, {})(Inventory);
