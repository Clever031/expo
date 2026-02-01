import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import axiosClient from '../api/axiosClient';

const AdminAddBookScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddBook = async () => {
        if (!title || !author || !quantity) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (isNaN(quantity) || parseInt(quantity) < 1) {
            Alert.alert('Error', 'Quantity must be a valid number greater than 0');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/books', {
                title,
                author,
                quantity: parseInt(quantity)
            });
            Alert.alert('Success', 'Book added successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        setTitle('');
                        setAuthor('');
                        setQuantity('');
                    }
                }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Add New Book</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Book Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter book title"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Author</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter author name"
                            value={author}
                            onChangeText={setAuthor}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter quantity"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAddBook}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Add Book</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdminAddBookScreen;
