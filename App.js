import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Registro from './screens/Registro';
import Login from './screens/Login';
import EsqueciMinhaSenha from './screens/SenhaRecovery';
import SelecaoViagem from './screens/SelecaoViagem';
import ListaViagens from './screens/ListaViagens';
import AdicionarViagem from './screens/AdicionarViagem';
import DetalhesViagem from './screens/DetalhesViagem';
import EditarViagem from './screens/EditarViagem';
import EditarDespesaDia from './screens/EditarDespesaDia';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="EsqueciMinhaSenha" component={EsqueciMinhaSenha} />
        <Stack.Screen name="SelecaoViagem" component={SelecaoViagem} />
        <Stack.Screen name="AdicionarViagem" component={AdicionarViagem} />
        <Stack.Screen name="ListaViagens" component={ListaViagens} />
        <Stack.Screen name="DetalhesViagem" component={DetalhesViagem} />
        <Stack.Screen name="EditarViagem" component={EditarViagem} />
        <Stack.Screen name="EditarDespesaDia" component={EditarDespesaDia} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
