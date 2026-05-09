import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import RemoveShoppingCartIcon from "@material-ui/icons/RemoveShoppingCart";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import axios from "axios";
import { connect } from "react-redux";
import { getCart, setCart, clearCart } from "../../utils/cart";

function ViewCart({ auth }) {
  const userId = auth && auth.user && auth.user.id ? auth.user.id : null;

  const [data, setData] = useState(() => getCart(userId));
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "" });

  useEffect(() => {
    setData(getCart(userId));
  }, [userId]);

  const persist = (next) => {
    setData(next);
    setCart(userId, next);
  };

  const updateQuantity = (id, delta) => {
    persist(
      data.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    persist(data.filter((item) => item.id !== id));
  };

  const total = data.reduce(
    (sum, c) => sum + (c.price || 0) * (c.quantity || 0),
    0
  );

  const isUserLoggedIn =
    auth && auth.isAuthenticated && auth.user && auth.user.userType === 0;

  const placeOrder = () => {
    if (!isUserLoggedIn || data.length === 0) return;
    setPlacing(true);

    const addressArr = auth.user.address;
    const address =
      Array.isArray(addressArr) && addressArr.length > 0
        ? addressArr[0].text || ""
        : "";

    const items = data.map((c) => ({
      productId: c.id,
      productName: c.productName,
      quantity: c.quantity,
      price: c.price,
    }));

    axios
      .post("http://localhost:5000/api/orders/place", {
        userId: auth.user.id,
        userName: auth.user.name,
        address,
        items,
      })
      .then(() => {
        setToast({ open: true, message: "Order placed successfully!" });
        clearCart(userId);
        setData([]);
      })
      .catch((err) => {
        const msg =
          (err.response && err.response.data && err.response.data.error) ||
          "Failed to place order";
        setToast({ open: true, message: msg });
      })
      .finally(() => setPlacing(false));
  };

  return (
    <div>
      {data.length === 0 && (
        <Grid container justify="center" style={{ marginTop: "3rem" }}>
          <Typography variant="h6" color="textSecondary">
            Your cart is empty.
          </Typography>
        </Grid>
      )}

      {data.map((cart) => {
        const { id, productName, price, quantity } = cart;

        return (
          <div key={id}>
            <Grid justify="center" container>
              <Grid item xs={4}>
                <Card variant="outlined" style={{ margin: "1.5rem" }}>
                  <CardContent>
                    <Grid container alignItems="center">
                      <Grid item xs>
                        <Typography
                          gutterBottom
                          variant="overline"
                          style={{ fontSize: "1.5rem" }}
                        >
                          {productName}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography gutterBottom variant="h6">
                          $ {quantity * price}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography color="textSecondary" variant="body2">
                      Quantity: {quantity}
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(id, -1)}
                        disabled={quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(id, 1)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Typography>

                    <Button color="secondary" onClick={() => removeItem(id)}>
                      Remove from cart <RemoveShoppingCartIcon />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        );
      })}

      {isUserLoggedIn && data.length > 0 && (
        <Grid container justify="center" style={{ marginTop: "1rem" }}>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent>
                <Grid container alignItems="center" justify="space-between">
                  <Typography variant="h6">Order total: $ {total}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CheckCircleIcon />}
                    onClick={placeOrder}
                    disabled={placing}
                  >
                    {placing ? "Placing..." : "Place Order"}
                  </Button>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast({ open: false, message: "" })}
        message={toast.message}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ViewCart);
