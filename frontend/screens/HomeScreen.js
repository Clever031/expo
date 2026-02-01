import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    Platform
} from 'react-native';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchBooks = async () => {
        try {
            const response = await axiosClient.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch books');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBooks();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBooks();
    };

    const handleBorrow = async (book) => {
        console.log('Borrow button clicked for:', book.title);

        if (book.quantity < 1) {
            alert('This book is out of stock.');
            return;
        }

        // Direct execution without Alert confirmation for Web compatibility testing
        try {
            setLoading(true);
            await axiosClient.post('/borrow', {
                user_id: user._id,
                book_id: book._id
            });

            await fetchBooks();

            // Use window.alert for web, or fallback
            if (Platform.OS === 'web') {
                window.alert('Success: Book borrowed!');
            } else {
                Alert.alert('Success', 'Book borrowed successfully!');
            }

        } catch (error) {
            console.error('Borrow Error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error';

            if (Platform.OS === 'web') {
                window.alert('Failed: ' + errorMsg);
            } else {
                Alert.alert('Borrow Failed', errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.bookInfo}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>by {item.author}</Text>
                <View style={styles.statusContainer}>
                    <View style={[styles.badge, item.quantity > 0 ? styles.badgeAvailable : styles.badgeOut]}>
                        <Text style={styles.badgeText}>
                            {item.quantity > 0 ? 'Available' : 'Out of Stock'}
                        </Text>
                    </View>
                    <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.borrowButton, item.quantity < 1 && styles.disabledButton]}
                onPress={() => handleBorrow(item)}
                disabled={item.quantity < 1}
            >
                <Text style={styles.buttonText}>Borrow</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Library Books</Text>
                <Text style={styles.subtext}>Welcome, {user?.username}</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={books}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No books available.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    subtext: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    bookInfo: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    author: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    badgeAvailable: {
        backgroundColor: '#E8F5E9',
    },
    badgeOut: {
        backgroundColor: '#FFEBEE',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    quantity: {
        fontSize: 12,
        color: '#888',
    },
    borrowButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

export default HomeScreen;
