import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListaViagens() {
  const navigation = useNavigation();
  const [viagens, setViagens] = useState([]);

  // Função para buscar viagens do usuário em tempo real
  const fetchViagens = () => {
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

      // Usando onSnapshot para escutar as mudanças em tempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const viagensData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setViagens(viagensData || []);
      });

      // Cleanup do unsubscribe
      return unsubscribe;
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
      Alert.alert('Erro', 'Não foi possível buscar as viagens.');
      setViagens([]);
    }
  };

  // Função para formatar o orçamento no padrão brasileiro
  const formatarOrcamento = (valor) => {
    return parseFloat(valor)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      .replace('R$', 'R$ ');
  };

  // Função para realizar o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao deslogar:', error);
      Alert.alert('Erro', 'Não foi possível desautenticar.');
    }
  };

  // UseEffect para carregar as viagens na tela
  useEffect(() => {
    const unsubscribe = fetchViagens();

    // Limpeza do unsubscribe ao desmontar o componente
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho com botão de desautenticação e botão de adicionar viagem */}
      <View style={styles.header}>
        {/* Botão de logout */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLogout}
        >
          <Icon name="run-fast" size={24} color="#2C2C54" style={styles.iconFlipped} />
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>Minhas Viagens</Text>

        {/* Botão de adicionar viagem */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('AdicionarViagem', { viagem: null })}
        >
        <Icon name="plus" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>

      {/* Lista de Viagens */}
      <FlatList
        data={viagens || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DetalhesViagem', { viagem: item })}
          >
            <Text style={styles.cardTitle}>{item.local}</Text>
            <Text style={styles.cardSubtitle}>
              {formatarOrcamento(item.orcamento)} •{' '}
              {item.periodo?.inicio ? new Date(item.periodo.inicio).toLocaleDateString('pt-BR') : 'N/A'}{' '}
              -{' '}
              {item.periodo?.fim ? new Date(item.periodo.fim).toLocaleDateString('pt-BR') : 'N/A'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhuma viagem encontrada.</Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F0F0',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 10,
  },
  iconFlipped: {
    transform: [{ scaleX: -1 }], // Espelha o ícone para a esquerda
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C54',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C54',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});
