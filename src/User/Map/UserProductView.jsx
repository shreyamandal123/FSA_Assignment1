import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import { Grid, Typography, IconButton, Snackbar } from "@material-ui/core";
import Header from "../Header";
import { blue } from "@material-ui/core/colors";
import { ShoppingCart, Add, Remove } from "@material-ui/icons";
import axios from "axios";
import { connect } from "react-redux";
import { addToCart } from "../../utils/cart";

class UserProductView extends React.Component {
  state = {
    storeName: "Store",
    productData: [],
    quantities: {},
    toast: { open: false, message: "" },
  };

  componentDidMount() {
    const { storeId } = this.props.match.params;
    axios.get(`http://localhost:5000/api/products/getProductsByStore/${storeId}`).then((res) => {
      this.setState({ productData: res.data || [] });
    });

    const name = this.props.location && this.props.location.state ? this.props.location.state.name : "Store";
    this.setState({ storeName: name });
  }

  getQuantity = (productId) => {
    const q = this.state.quantities[productId];
    return Number.isFinite(q) && q > 0 ? q : 1;
  };

  setQuantity = (productId, value) => {
    this.setState((prev) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [productId]: Math.max(1, Number(value) || 1),
      },
    }));
  };

  handleAddToCart = (product) => {
    const userId = this.props.auth && this.props.auth.user ? this.props.auth.user.id : null;
    const quantity = this.getQuantity(product._id);

    addToCart(userId, {
      id: product._id,
      productName: product.productName,
      price: Number(product.price),
      quantity: Number(quantity),
    });

    this.setState({
      toast: {
        open: true,
        message: `Added ${quantity} x ${product.productName} to cart`,
      },
    });
  };

  render() {
    return (
      <div>
        <Header />
        <Grid justify="center" container>
          <Typography style={{ fontSize: "1.5rem" }} variant="overline">
            Welcome to {this.state.storeName}
          </Typography>
        </Grid>

        {this.state.productData.length === 0 && (
          <Grid container justify="center" style={{ marginTop: "2rem" }}>
            <Typography variant="h6" color="textSecondary">
              No products found for this shop.
            </Typography>
          </Grid>
        )}

        <Grid justify="center" container>
          {this.state.productData.map((product) => {
            const quantity = this.getQuantity(product._id);
            return (
              <Grid item xs={4} key={product._id}>
                <Card variant="outlined" style={{ margin: "2rem" }}>
                  <CardContent>
                    <Typography style={{ fontSize: "1rem" }} variant="overline" display="block">
                      Product - {product.productName}
                    </Typography>
                    <hr />
                    <Typography style={{ fontSize: "1rem" }} variant="overline" display="block">
                      Price - {product.price}
                    </Typography>
                    <Typography style={{ fontSize: "1rem" }} variant="overline" display="block">
                      Product Category - {product.category}
                    </Typography>
                    <Typography style={{ fontSize: "1rem" }} variant="overline" display="block">
                      In Stock - {product.quantity}
                    </Typography>
                    <Grid container justify="space-between">
                      <Grid item>
                        <Button variant="outlined" size="large" style={{ color: blue[500] }} startIcon={<ShoppingCart />} onClick={() => this.handleAddToCart(product)}>
                          Add to Cart
                        </Button>
                      </Grid>
                      <Grid item>
                        <IconButton onClick={() => this.setQuantity(product._id, quantity - 1)} disabled={quantity <= 1}>
                          <Remove />
                        </IconButton>
                        {quantity}
                        <IconButton onClick={() => this.setQuantity(product._id, quantity + 1)}>
                          <Add />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Snackbar
          open={this.state.toast.open}
          autoHideDuration={2500}
          onClose={() => this.setState({ toast: { open: false, message: "" } })}
          message={this.state.toast.message}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ auth: state.auth });

export default connect(mapStateToProps, {})(UserProductView);
