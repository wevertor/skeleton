import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import auth from "./../auth/AuthHelper";
import { read, update } from "./ApiUser";
import { validateEmail, validatePassword } from "./../auth/Validation";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Icon,
  CardActions,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 600,
    margin: "auto",
    textAlign: "center",
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle,
  },
  error: { verticalAlign: "middle" },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
  },
  submit: {
    margin: "auto",
    marginBottom: theme.spacing(2),
  },
}));

export default function EditProfile({ match }) {
  const classes = useStyles();

  // estados
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    open: false,
    error: "",
    redirectToProfile: false,
  });

  const [errorText, setErrorText] = useState({
    name: "",
    nameError: false,
    email: "",
    emailError: false,
    password: "",
    passwordError: false,
  });

  // autenticação
  const jwt = auth.isAuthenticated();

  // carrega as informações atuais do usuário
  useEffect(() => {
    let mounted = true;
    read({ userId: jwt.user._id }, { t: jwt.token }).then((data) => {
      if (mounted) {
        if (data && data.error) setValues({ ...values, error: data.error });
        else setValues({ ...values, name: data.name, email: data.email });
      }
    });
    return () => {
      mounted = false;
    };
  }, [match.params.userId]);

  // envia dados atualizados
  const clickSubmit = () => {
    // armazena
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      password: values.password || undefined,
    };

    // valida
    if (!user.name || user.name.length < 3) {
      setErrorText({
        ...errorText,
        name: "Insira um nome de usuário com ao menos 3 caracteres.",
        nameError: true,
      });
    }

    if (!user.email || !validateEmail(user.email)) {
      setErrorText({
        ...errorText,
        email: "Insira um endereço de email válido.",
        emailError: true,
      });
    }

    if (!user.password || !validatePassword(user.password)) {
      setErrorText({
        ...errorText,
        password: "Insira uma senha com pelo menos 6 caracteres.",
        passwordError: true,
      });
    }

    // envia
    update({ userId: match.params.userId }, { t: jwt.token }, user).then(
      (data) => {
        if (data && data.error) setValues({ ...values, error: data.error });
        else
          setValues({ ...values, userId: data._id, redirectToProfile: true });
      }
    );
  };

  // lida com uma eventual mudança nos valores e atualiza o estado
  const handleChange = (fieldName) => (event) => {
    setValues({ ...values, [fieldName]: event.target.value });
    setErrorText({
      ...errorText,
      [fieldName]: "",
      [fieldName + "Error"]: false,
    });
  };

  if (values.redirectToProfile)
    return <Redirect to={`/user/${values.userId}`} />;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Editar Usuário
        </Typography>
        <form>
          <TextField
            id="nome"
            label="Nome"
            className={classes.textField}
            value={values.name}
            onChange={handleChange("name")}
            margin="normal"
            error={errorText.nameError}
            helperText={errorText.name}
            autoComplete="off"
          />
          <br />
          <TextField
            id="email"
            label="Email"
            className={classes.textField}
            value={values.email}
            onChange={handleChange("email")}
            margin="normal"
            error={errorText.emailError}
            helperText={errorText.email}
          />
          <br />
          <TextField
            id="senha"
            label="Senha"
            type="password"
            className={classes.textField}
            value={values.password}
            onChange={handleChange("password")}
            margin="normal"
            error={errorText.passwordError}
            helperText={errorText.password}
          />
        </form>

        <br />
        {/* se houver algum erro */}
        {values.error && (
          <Typography component="p" color="error">
            <Icon color="error" className={classes.error}>
              error
            </Icon>
            {values.error}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          onClick={clickSubmit}
          className={classes.submit}
        >
          Confirmar
        </Button>
      </CardActions>
    </Card>
  );
}
