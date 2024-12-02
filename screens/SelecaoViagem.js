import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Certifique-se de importar corretamente
import Icon from 'react-native-vector-icons/Ionicons';

export default function SelecaoViagem() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');

  const checkExistingViagens = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      const viagensRef = collection(db, 'viagens');
      const q = query(viagensRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ListaViagens' }],
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar viagens:', error);
      Alert.alert('Erro', 'Não foi possível verificar as viagens.');
    }
  };

  const definirSaudacao = () => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) {
      setGreeting('Bom dia');
    } else if (horaAtual < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.displayName) {
      setNomeUsuario(user.displayName);
    } else {
      setNomeUsuario('Usuário');
    }
    definirSaudacao();
    checkExistingViagens();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Verificando viagens...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>
        {greeting}, {nomeUsuario}!
      </Text>
      <Text style={styles.subTitle}>
        Oops! Parece que você ainda não possui viagens agendadas... Mas tudo bem, você pode começar por aqui!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdicionarViagem')}
      >
        <Text style={styles.buttonText}>Adicionar uma Nova Viagem</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F0F0',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  iconButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C54',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#FF6A6A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
