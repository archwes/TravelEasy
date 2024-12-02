import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EditarDia() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dia, despesas } = route.params;

  const [novaDespesa, setNovaDespesa] = useState({ nome: '', valor: '' });
  const [listaDespesas, setListaDespesas] = useState(despesas || []);

  const adicionarDespesa = () => {
    if (novaDespesa.nome && novaDespesa.valor) {
      setListaDespesas([...listaDespesas, { ...novaDespesa, id: Date.now().toString() }]);
      setNovaDespesa({ nome: '', valor: '' });
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  const salvarDespesas = () => {
    if (listaDespesas.length > 0) {
      navigation.navigate('DetalhesViagem', { dia, despesas: listaDespesas });
    } else {
      Alert.alert('Erro', 'Nenhuma despesa foi adicionada.');
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesas de {dia.toLocaleDateString('pt-BR')}</Text>
      <FlatList
        data={listaDespesas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.despesaItem}>
            <Text style={styles.despesaText}>{item.nome}: {parseFloat(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
          </View>
        )}
        ListEmptyComponent={() => <Text style={styles.emptyText}>Nenhuma despesa adicionada.</Text>}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome da Despesa"
        value={novaDespesa.nome}
        onChangeText={(text) => setNovaDespesa({ ...novaDespesa, nome: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor da Despesa"
        value={novaDespesa.valor}
        onChangeText={(text) => setNovaDespesa({ ...novaDespesa, valor: text })}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.addButton} onPress={adicionarDespesa}>
        <Text style={styles.addButtonText}>Adicionar Despesa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={salvarDespesas}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C54',
    marginBottom: 20,
    textAlign: 'center',
  },
  despesaItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  despesaText: {
    fontSize: 16,
    color: '#2C2C54',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FF6A6A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2C2C54',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});
