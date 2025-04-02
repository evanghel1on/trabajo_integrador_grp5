import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarMonthIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { createBooking } from '../../services/bookingService';
import Login from "../../components/login/Login";
import ReservaConfirmada from "../../components/reservaConfirmada/ReservaConfirmada";

const BookingReview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtenemos los datos necesarios desde el estado de la navegación
  const { product, selectedDate, selectedPeople, totalPrice } = location.state || {};

  // Estados para los campos del usuario (sin localStorage, inician vacíos)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Estados para errores
  const [errors, setErrors] = useState({});

  // Método de pago y datos de tarjeta
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Control del modal de Login
  const [openLogin, setOpenLogin] = useState(false);
  const handleCloseLogin = () => {
    setOpenLogin(false);
  };
  const handleLogin = (emailValue, passwordValue) => {
    // Lógica real de login
    setOpenLogin(false);
  };

  // Control del modal de confirmación de reserva
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  // Función para eliminar el producto de la reserva (regresa a la página anterior)
  const handleRemoveProduct = () => {
    Swal.fire({
      title: '¿Deseas eliminar este producto de la reserva?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FD346E',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(-1);
      }
    });
  };

  // Validación de formulario
  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido.';
    } else if (firstName.trim().length < 5) {
      newErrors.firstName = 'El nombre debe tener al menos 5 caracteres.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido.';
    } else if (lastName.trim().length < 5) {
      newErrors.lastName = 'El apellido debe tener al menos 5 caracteres.';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Ingresa un correo electrónico válido.';
      }
    }

    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es requerido.';
    } else {
      const phoneRegex = /^[0-9]*$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'El teléfono solo debe contener números.';
      }
    }

    if (paymentMethod === 'tarjeta') {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = 'Número de tarjeta requerido.';
      }
      if (!expiryDate.trim()) {
        newErrors.expiryDate = 'Fecha de expiración requerida.';
      }
      if (!cvv.trim()) {
        newErrors.cvv = 'CVV requerido.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Confirmar reserva
  const handleConfirmBooking = async () => {
    if (!validateForm()) {
      return;
    }

    Swal.fire({
      title: '¿Confirmar esta reservación?',
      text: 'Verifica que tus datos sean correctos antes de continuar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FD346E',
      cancelButtonColor: '#999',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Revisar si hay token
          const token = localStorage.getItem('token');
          if (!token) {
            setOpenLogin(true);
            return;
          }

          // Buscar disponibilidad según fecha
          const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
          const selectedAvailability = product.availabilitySet?.find(
            (a) => a.date === formattedSelectedDate
          );

          if (!selectedAvailability) {
            Swal.fire({
              icon: 'error',
              title: 'Error de disponibilidad',
              text: 'No se encontró disponibilidad para la fecha elegida.'
            });
            return;
          }

          // Armar payload
          const bookingData = {
            product_id: product.id,
            availability_id: selectedAvailability.id,
            quantity: selectedPeople
          };

          // Crear la reserva
          const bookingResponse = await createBooking(bookingData);
          if (bookingResponse) {
            // Mostramos modal de reserva confirmada
            setReservaConfirmada(bookingResponse);
            setOpenConfirmModal(true);
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography color="error">
          No hay información de producto para mostrar. Por favor regresa al detalle.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '90%', margin: '0 auto', mt: 4 }}>
      {/* Modal de Login */}
      <Login
        open={openLogin}
        handleClose={handleCloseLogin}
        handleLogin={handleLogin}
      />

      {/* Modal de confirmación de reserva */}
      {openConfirmModal && reservaConfirmada && (
        <ReservaConfirmada
          reserva={reservaConfirmada}
          onClose={() => setOpenConfirmModal(false)}
        />
      )}

      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
          Revisa tu pedido
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Columna Izquierda: Info producto */}
        <Grid item xs={12} md={8}>
          <Card sx={{ position: 'relative', p: 2 }}>
            <CardMedia
              component="img"
              height="300"
              sx={{ objectFit: 'cover', borderRadius: 2 }}
              image={
                product.imageSet?.[0]?.imageUrl ||
                'https://picsum.photos/200/300'
              }
              alt={product.name}
            />
            <CardContent sx={{ position: 'relative' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                {product.name}
              </Typography>

              {/* Fecha */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarMonthIcon sx={{ color: '#00A8A8', mr: 1 }} />
                <Typography>
                  {new Date(selectedDate).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Ciudad */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ color: '#00A8A8', mr: 1 }} />
                <Typography>
                  {product.city?.name}, {product.city?.country}
                </Typography>
              </Box>

              {/* Personas */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupIcon sx={{ color: '#00A8A8', mr: 1 }} />
                <Typography>
                  {selectedPeople} persona(s) x ${product.price?.toFixed(2)}
                </Typography>
              </Box>

              {/* Botón eliminar */}
              <IconButton
                onClick={handleRemoveProduct}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: '#FD346E',
                }}
              >
                <DeleteIcon />
              </IconButton>

              {/* Total */}
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  color: '#FD346E',
                  fontWeight: 'bold'
                }}
              >
                Total: ${totalPrice?.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna Derecha: Datos usuario + Pago */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 2,
              mb: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#00CED1' }}>
              Datos de la información del usuario
            </Typography>

            <Typography sx={{ fontWeight: 'bold' }}>Nombres</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ingresa tus nombres"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors({ ...errors, firstName: '' });
              }}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              sx={{ mb: 2 }}
            />

            <Typography sx={{ fontWeight: 'bold' }}>Apellidos</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ingresa tus apellidos"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrors({ ...errors, lastName: '' });
              }}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              sx={{ mb: 2 }}
            />

            <Typography sx={{ fontWeight: 'bold' }}>Correo Electrónico</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              error={Boolean(errors.email)}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />

            <Typography sx={{ fontWeight: 'bold' }}>Teléfono móvil</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="0991234567"
              value={phone}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, '');
                setPhone(onlyNums);
                setErrors({ ...errors, phone: '' });
              }}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              sx={{ mb: 2 }}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 2,
              mb: 2
            }}
          >
            <FormLabel
              id="payment-method-label"
              sx={{ fontWeight: 'bold', mb: 1, color: '#00CED1' }}
            >
              Selecciona un método de pago
            </FormLabel>
            <RadioGroup
              aria-labelledby="payment-method-label"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="tarjeta"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Ícono Tarjeta de Crédito */}
                    <img
                      src="https://cdn-icons-png.freepik.com/512/5552/5552677.png?ga=GA1.1.1251921206.1743563784"
                      alt="Tarjeta"
                      style={{ width: 24, height: 24 }}
                    />
                    <Typography>Tarjeta de crédito</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="googlepay"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Ícono Google Pay */}
                    <img
                      src="https://cdn-icons-png.freepik.com/512/6124/6124998.png?ga=GA1.1.1251921206.1743563784"
                      alt="Google Pay"
                      style={{ width: 24, height: 24 }}
                    />
                    <Typography>Google Pay</Typography>
                  </Box>
                }
              />
            </RadioGroup>

            {paymentMethod === 'tarjeta' && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>Número de tarjeta</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value);
                    setErrors({ ...errors, cardNumber: '' });
                  }}
                  error={Boolean(errors.cardNumber)}
                  helperText={errors.cardNumber}
                  sx={{ mb: 2 }}
                />

                <Typography sx={{ fontWeight: 'bold' }}>Fecha de expiración</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    setErrors({ ...errors, expiryDate: '' });
                  }}
                  error={Boolean(errors.expiryDate)}
                  helperText={errors.expiryDate}
                  sx={{ mb: 2 }}
                />

                <Typography sx={{ fontWeight: 'bold' }}>CVV</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value);
                    setErrors({ ...errors, cvv: '' });
                  }}
                  error={Boolean(errors.cvv)}
                  helperText={errors.cvv}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </Box>

          <Box
            sx={{
              p: 2,
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 2,
              mb: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#00CED1', mb: 1 }}>
              Total a pagar
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              ${totalPrice?.toFixed(2)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{ backgroundColor: '#FD346E', p: 2 }}
            onClick={handleConfirmBooking}
          >
            Confirmar Reserva
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingReview;
