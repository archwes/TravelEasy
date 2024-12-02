import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function DetalhesViagem() {
  const navigation = useNavigation();
  const route = useRoute();
  const { viagem } = route.params; // Recebe os dados da viagem selecionada
  const [dias, setDias] = useState([]);
  const [detalhesViagem, setDetalhesViagem] = useState(viagem);

  // Função para escutar as alterações da viagem em tempo real
  const carregarViagemAtualizada = () => {
    try {
      const viagemRef = doc(db, 'viagens', detalhesViagem.id);
      const unsubscribe = onSnapshot(viagemRef, (viagemSnapshot) => {
        if (viagemSnapshot.exists()) {
          const dadosAtualizados = viagemSnapshot.data();
          setDetalhesViagem({ id: viagemSnapshot.id, ...dadosAtualizados });

          if (dadosAtualizados.periodo?.inicio && dadosAtualizados.periodo?.fim) {
            const inicio = new Date(dadosAtualizados.periodo.inicio);
            const fim = new Date(dadosAtualizados.periodo.fim);
            const diasCustomizaveis = [];

            for (let d = inicio; d <= fim; d.setDate(d.getDate() + 1)) {
              diasCustomizaveis.push(new Date(d));
            }

            setDias(diasCustomizaveis);
          }
        } else {
          Alert.alert('Erro', 'Viagem não encontrada.');
        }
      });

      // Cleanup da escuta
      return unsubscribe;
    } catch (error) {
      console.error('Erro ao carregar viagem:', error);
      Alert.alert('Erro', 'Não foi possível carregar a viagem atualizada.');
    }
  };

  useEffect(() => {
    const unsubscribe = carregarViagemAtualizada();
    return () => unsubscribe(); // Limpeza do unsubscribe ao desmontar o componente
  }, [viagem]);

  const renderDia = ({ item, index }) => {
    return (
      <View style={styles.diaCard}>
        <Text style={styles.diaText}>
          Dia {index + 1}: {item.toLocaleDateString('pt-BR')}
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="pencil-outline" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho com botão de Go Back e Editar */}
      <View style={styles.header}>
        {/* Botão de Go Back */}
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2C2C54" />
        </TouchableOpacity>

        {/* Botão de Editar Viagem */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate('EditarViagem', { viagem: detalhesViagem })
          }
        >
          <Icon name="pencil-outline" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Detalhes de {detalhesViagem.local}</Text>
      <Text style={styles.subtitle}>
        Orçamento:{' '}
        {parseFloat(detalhesViagem.orcamento).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}
      </Text>
      <Text style={styles.subtitle}>
        Check-in:{' '}
        {new Date(detalhesViagem.periodo.inicio).toLocaleDateString('pt-BR')} • Check-out:{' '}
        {new Date(detalhesViagem.periodo.fim).toLocaleDateString('pt-BR')}
      </Text>
      <FlatList
        data={dias}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderDia}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhum dia customizável encontrado.</Text>
        )}
      />
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 50,
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  diaCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  diaText: {
    fontSize: 16,
    color: '#2C2C54',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6A6A',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});
