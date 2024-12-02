import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function EditarDespesaDia() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dia, viagemId } = route.params;

  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState('');
  const [valorDespesa, setValorDespesa] = useState('');

  const adicionarDespesa = () => {
    if (!novaDespesa || !valorDespesa) {
      Alert.alert('Erro', 'Preencha o nome e o valor da despesa.');
      return;
    }
    const despesa = {
      nome: novaDespesa,
      valor: parseFloat(valorDespesa),
    };
    setDespesas([...despesas, despesa]);
    setNovaDespesa('');
    setValorDespesa('');
  };

  const salvarDespesas = async () => {
    try {
      const diaRef = doc(db, 'viagens', viagemId);
      await updateDoc(diaRef, {
        [`dias.${dia}`]: arrayUnion(...despesas),
      });
      Alert.alert('Sucesso', 'Despesas salvas com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as despesas.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#2C2C54" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Adicionar despesa para o dia {dia}</Text>

      <FlatList
        data={despesas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.despesaItem}>
            <Text style={styles.input}>{item.nome}</Text>
            <Text style={styles.input}>
              {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma despesa adicionada.</Text>
        }
      />

      <View style={styles.centerContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={novaDespesa}
            onChangeText={setNovaDespesa}
            placeholder="Nome da despesa"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={valorDespesa}
            onChangeText={setValorDespesa}
            placeholder="Valor da despesa"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={adicionarDespesa}>
          <Text style={styles.addButtonText}>Adicionar Despesa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={salvarDespesas}>
          <Text style={styles.saveButtonText}>Salvar Despesas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  iconButton: {
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F0F0',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C54',
    marginTop: 80,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C54',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  despesaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF6A6A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
