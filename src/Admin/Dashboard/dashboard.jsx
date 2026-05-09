import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Grid,
  Button,
  Snackbar,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import axios from "axios";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
  },
  headertable: {
    backgroundColor: "#e6f0ff",
  },
}));

export default function OrderList() {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "" });

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const fetchOrders = () => {
    axios
      .get("http://localhost:5000/api/orders/all")
      .then((res) => setOrders(res.data))
      .catch((err) => {
        const msg =
          (err.response && err.response.data && err.response.data.error) ||
          "Failed to load orders";
        setToast({ open: true, message: msg });
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    axios
      .patch(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
      })
      .then((res) => {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
        setToast({ open: true, message: "Order updated" });
      })
      .catch(() => setToast({ open: true, message: "Failed to update status" }));
  };

  const handleDelete = (orderId) => {
    axios
      .delete(`http://localhost:5000/api/orders/${orderId}`)
      .then(() => {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        setToast({ open: true, message: "Order deleted" });
      })
      .catch(() => setToast({ open: true, message: "Failed to delete order" }));
  };

  if (orders.length === 0) {
    return (
      <Grid container justify="center" style={{ marginTop: "2rem" }}>
        <Typography variant="h6" color="textSecondary">
          No orders to ship.
        </Typography>
      </Grid>
    );
  }

  return (
    <div className={classes.root}>
      {orders.map((order) => {
        const { _id, userName, address, items = [], total, status } = order;

        return (
          <Grid container justify="center" key={_id}>
            <Grid item xs={8}>
              <Accordion
                expanded={expanded === _id}
                onChange={handleChange(_id)}
                style={{ margin: "0.5rem" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls={`${_id}-content`}
                  id={`${_id}-header`}
                >
                  <Grid container justify="space-between" alignItems="center">
                    <Typography>{userName}</Typography>
                    <Typography>{address}</Typography>
                    <Typography>Status: {status}</Typography>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container direction="column" spacing={2}>
                    <Grid item>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow className={classes.headertable}>
                              <TableCell>Product</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Cost</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item, idx) => (
                              <TableRow key={`${_id}_${idx}`}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.price}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid item>
                      <Grid container justify="space-between" alignItems="center">
                        <Typography variant="h6">Total: $ {total}</Typography>
                        <Grid>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleStatusChange(_id, "pending")}
                          >
                            Pending
                          </Button>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleStatusChange(_id, "shipped")}
                          >
                            Shipped
                          </Button>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleStatusChange(_id, "delivered")}
                          >
                            Delivered
                          </Button>
                          <Button
                            size="small"
                            color="secondary"
                            onClick={() => handleDelete(_id)}
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        );
      })}

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ open: false, message: "" })}
        message={toast.message}
      />
    </div>
  );
}
