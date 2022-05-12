// utils
import { filter, sample } from "lodash";
import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from "@mui/material";
import { db, auth, app, functions } from "../Firebase/firebase";
// material
// components
import Page from "../components/Page";
import Label from "../components/Label";
import Scrollbar from "../components/Scrollbar";
import SearchNotFound from "../components/SearchNotFound";
import {
  UserListHead,
  UserListToolbar,
  UserMoreMenu,
} from "../components/_dashboard/user";
import { mockImgAvatar } from "../utils/mockImages";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "firstName", label: "First Name", alignRight: false },
  { id: "lastName", label: "Last Name", alignRight: false },
  { id: "email", label: "Email", alignRight: false },
  { id: "phone", label: "Phone", alignRight: false },
  { id: "address", label: "Address", alignRight: false },
  { id: "state", label: "State", alignRight: false },
  { id: "country", label: "Country", alignRight: false },
  { id: "gender", label: "Gender", alignRight: false },
  { id: "refNum", label: "Reference Number", alignRight: false },
  { id: "marital", label: "Marital Status", alignRight: false },
  { id: "totalDeposit", label: "Total Deposit", alignRight: false },
  { id: "currentBalance", label: "Current Balance", alignRight: false },
  {
    id: "availableForWithdrawal",
    label: "Available For Withdrawal",
    alignRight: false,
  },
  { id: "" },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function User() {
  const [currentUser, setCurrentUser] = useState();
  const [adminToken, setAdminToken] = useState();
  const [usersList, setUsersList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          if (!idTokenResult.claims.admin) {
            navigate("/login");
          }
        });
        setCurrentUser(user);
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const unSubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsersList(snapshot.docs.map((doc) => doc.data()));
    });
    return unSubscribe;
  }, []);

  const users = usersList.map((user) => ({
    id: user?.userID,
    // avatarUrl: mockImgAvatar(index + 1),
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phone: user?.phone,
    address: user?.address,
    state: user?.state,
    country: user?.country,
    gender: user?.gender,
    refNum: user?.refNum,
    marital: user?.marital,
    totalDeposit: user?.totalDeposit,
    currentBalance: user?.currentBalance,
    availableForWithdrawal: user?.availableForWithdrawal,
  }));

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(
    users,
    getComparator(order, orderBy),
    filterName
  );

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <div>
      <Page title="User | Dashboard">
        <Container>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={5}
          >
            <Typography variant="h4" gutterBottom>
              Users
            </Typography>
          </Stack>

          <Card>
            <UserListToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
            />

            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={users.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredUsers
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => {
                        const {
                          id,
                          firstName,
                          lastName,
                          email,
                          phone,
                          address,
                          state,
                          country,
                          gender,
                          refNum,
                          marital,
                          totalDeposit,
                          currentBalance,
                          availableForWithdrawal,
                        } = row;

                        return (
                          <TableRow hover key={id} tabIndex={-1}>
                            <TableCell align="left">{firstName}</TableCell>
                            <TableCell align="left">{lastName}</TableCell>
                            <TableCell align="left">{email}</TableCell>
                            <TableCell align="left">{phone}</TableCell>
                            <TableCell align="left">{address}</TableCell>
                            <TableCell align="left">{state}</TableCell>
                            <TableCell align="left">{country}</TableCell>
                            <TableCell align="left">{gender}</TableCell>
                            <TableCell align="left">{refNum}</TableCell>
                            <TableCell align="left">{marital}</TableCell>
                            <TableCell align="left">{totalDeposit}</TableCell>
                            <TableCell align="left">{currentBalance}</TableCell>
                            <TableCell align="left">
                              {availableForWithdrawal}
                            </TableCell>

                            <TableCell align="right">
                              <UserMoreMenu
                                uid={id}
                                firstName={firstName}
                                email={email}
                                totalDeposit={totalDeposit}
                                currentBalance={currentBalance}
                                availableForWithdrawal={availableForWithdrawal}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                  {isUserNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterName} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </Page>
    </div>
  );
}
